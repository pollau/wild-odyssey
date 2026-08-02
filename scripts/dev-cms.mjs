// Lance le serveur de dev avec Keystatic en mode CLOUD, pour tester en local
// exactement le parcours de Lionel (connexion Keystatic Cloud, ecriture sur une
// branche GitHub) au lieu d'ecrire dans les fichiers du disque.
//
// Keystatic Cloud n'autorise l'authentification locale que depuis 127.0.0.1
// (option "Allow local development" du projet), d'ou le --host explicite.
//
// Usage : npm run dev:cms

import { spawn } from "node:child_process";

const astro = process.platform === "win32" ? "astro.cmd" : "astro";

spawn(astro, ["dev", "--host", "127.0.0.1"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, PUBLIC_KEYSTATIC_STORAGE: "cloud" },
}).on("exit", (code) => process.exit(code ?? 0));
