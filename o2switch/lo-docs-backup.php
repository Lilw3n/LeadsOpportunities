<?php
/**
 * Copie de secours documents Leads Opportunities — à déposer sur o2switch (cPanel).
 *
 * 1. Copier ce fichier dans public_html (ex. public_html/lo-docs-backup.php).
 * 2. Copier lo-docs-backup.config.example.php → lo-docs-backup.config.php
 *    (même dossier) et renseigner le secret.
 * 3. Sur Vercel : O2SWITCH_BACKUP_URL = https://VOTRE-DOMAINE/lo-docs-backup.php
 *                O2SWITCH_BACKUP_SECRET = le même secret.
 *
 * Les fichiers sont écrits hors webroot (../lo-docs-data) par défaut.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = array(
    'secret' => getenv('O2SWITCH_BACKUP_SECRET') ?: '',
    'dir' => dirname(__DIR__) . '/lo-docs-data',
    'maxBytes' => 12 * 1024 * 1024,
);

$configFile = __DIR__ . '/lo-docs-backup.config.php';
if (is_file($configFile)) {
    $loaded = include $configFile;
    if (is_array($loaded)) {
        $config = array_merge($config, $loaded);
    }
}

function lo_json($code, $payload) {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lo_secret_ok($expected, $provided) {
    if ($expected === '' || $provided === '') {
        return false;
    }
    if (function_exists('hash_equals')) {
        return hash_equals($expected, $provided);
    }
    return $expected === $provided;
}

function lo_read_secret($config) {
    $hdr = '';
    if (!empty($_SERVER['HTTP_X_LO_BACKUP_SECRET'])) {
        $hdr = trim($_SERVER['HTTP_X_LO_BACKUP_SECRET']);
    }
    $auth = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if ($auth === '' && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (stripos($auth, 'Bearer ') === 0) {
        $hdr = trim(substr($auth, 7));
    }
    return $hdr;
}

function lo_safe_segment($value, $fallback) {
    $s = preg_replace('/[^\w.\-@]+/', '_', (string) $value);
    $s = ltrim($s, '.');
    $s = substr($s, 0, 80);
    return $s !== '' ? $s : $fallback;
}

$provided = lo_read_secret($config);
$expected = (string) $config['secret'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($_GET['ping'])) {
        lo_json(405, array('ok' => false, 'error' => 'GET ping=1 uniquement'));
    }
    if (!lo_secret_ok($expected, $provided)) {
        lo_json(401, array('ok' => false, 'error' => 'unauthorized'));
    }
    $dir = $config['dir'];
    $writable = false;
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    $writable = is_dir($dir) && is_writable($dir);
    lo_json(200, array(
        'ok' => true,
        'writable' => $writable,
        'dataDir' => basename($dir),
        'php' => PHP_VERSION,
        'maxBytes' => (int) $config['maxBytes'],
    ));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lo_json(405, array('ok' => false, 'error' => 'Method not allowed'));
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) {
    lo_json(400, array('ok' => false, 'error' => 'JSON invalide'));
}

$fromBody = isset($body['secret']) ? (string) $body['secret'] : '';
if (!lo_secret_ok($expected, $provided) && !lo_secret_ok($expected, $fromBody)) {
    lo_json(401, array('ok' => false, 'error' => 'unauthorized'));
}

$fileName = lo_safe_segment(isset($body['fileName']) ? $body['fileName'] : 'document', 'document');
$contactId = lo_safe_segment(isset($body['contactId']) ? $body['contactId'] : 'sans_contact', 'sans_contact');
$subfolder = lo_safe_segment(isset($body['subfolder']) ? $body['subfolder'] : '01_identite', '01_identite');
$b64 = isset($body['contentBase64']) ? (string) $body['contentBase64'] : '';
$b64 = preg_replace('/^data:[^;]+;base64,/', '', $b64);
$bin = base64_decode($b64, true);
if ($bin === false || $bin === '') {
    lo_json(400, array('ok' => false, 'error' => 'contentBase64 invalide'));
}

$max = (int) $config['maxBytes'];
if (strlen($bin) > $max) {
    lo_json(413, array('ok' => false, 'error' => 'Fichier trop volumineux'));
}

$year = date('Y');
$rel = $year . '/' . $contactId . '/' . $subfolder;
$destDir = rtrim($config['dir'], '/') . '/' . $rel;
if (!is_dir($destDir) && !@mkdir($destDir, 0750, true)) {
    lo_json(500, array('ok' => false, 'error' => 'Impossible de creer le dossier'));
}

$stamp = date('Ymd-His');
$destName = $stamp . '_' . $fileName;
$full = $destDir . '/' . $destName;
if (file_put_contents($full, $bin) === false) {
    lo_json(500, array('ok' => false, 'error' => 'Ecriture impossible'));
}

lo_json(200, array(
    'ok' => true,
    'path' => $full,
    'relativePath' => $rel . '/' . $destName,
    'bytes' => strlen($bin),
    'storedAt' => date('c'),
));
