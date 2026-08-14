<?php
/**
 * Copier ce fichier en lo-docs-backup.config.php (même dossier que le PHP)
 * et renseigner un secret long. Ne pas committer le fichier réel.
 */
return array(
    'secret' => 'changez-moi-par-un-secret-long-32-caracteres-min',
    // Hors webroot recommandé : parent de public_html
    'dir' => dirname(__DIR__) . '/lo-docs-data',
    'maxBytes' => 12 * 1024 * 1024,
);
