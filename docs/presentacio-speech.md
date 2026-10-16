# Guió de presentació — Xarxa Anglesola

Guió parlat per defensar el TFM. Les [slides](https://xarxanglesola.vercel.app/presentacio) van en castellà; aquest text és en català, per dir-lo en veu alta. Durada orientativa: **12–15 minuts** (sense demo) o **18–20** si obres l’app.

**Com usar-lo:** una diapositiva = un bloc. No cal llegir-ho tot: el paràgraf en negreta és el nucli; la resta és si tens temps o si pregunten.

---

## 1. Portada

**Això no és un treball sobre un framework. És el treball de fi d’un màster d’IA aplicada al desenvolupament de software.**

Em dic Xavier i us presento Xarxa Anglesola: una app de barri per prestar el que ja tenim — eines, llibres, bicis — amb catàleg, reserves i xat en temps real.

Està publicada i en ús: no és un prototip tancat al portàtil. El stack — Next.js, PostgreSQL, Socket.IO, Vercel i Railway — és el vehicle. El que vull demostrar és **com he desenvolupat**: amb agents, regles, tests i criteri de seguretat, que és el que ensenya el màster.

---

## 2. El problema

**El barri ja comparteix. El que falta és infraestructura.**

Avui el préstec viu a WhatsApp, a la nota de la porteria i a la memòria. Es perd l’estat: no saps si allò està lliure, reservat o en préstec. No hi ha històric.

Això és anàlisi de requisits del mòdul d’enginyeria de software: un problema real, usuaris reals, i una necessitat que no és “fer una botiga”. El que fa falta és un lloc comú, al mòbil i a l’escriptori, on publicar, reservar, parlar i veure l’estat.

---

## 3. La solució

**Una app de barri, no un marketplace.**

No hi ha pagaments ni anuncis. El valor és la confiança entre veïns i un cicle clar: publicar → reservar → xat privat → préstec → devolució.

Això ve del cicle de vida del software i de no confondre producte amb demo: cada pas té estat al sistema. No és un catàleg estàtic.

---

## 4. Funcionalitats

**El que pot fer un veí, d’un cop d’ull.**

Compte amb nickname i contrasenya o Google; recuperar clau; completar perfil si entres amb OAuth. Catàleg amb fotos, filtres, graella o llista, i estat visible. Favorits, que avisen el propietari. Xat general i missatge privat lligat a un producte. Alertes a la campana i Web Push, amb preferències. I drets RGPD: exportar o esborrar el compte.

Aquí ja es veu producte, no pantalles soltes: auth, dades, comunicació i cicle de vida de la informació personal.

---

## 5. Arquitectura

**La web a Vercel, el temps real a Railway. Això no és casual.**

Next.js fa la UI i les API routes. PostgreSQL amb Prisma guarda usuaris, productes i missatges. Socket.IO, a Railway, fa el xat i el broadcast d’estat. Les imatges van a Vercel Blob. El Web Push surt del servidor de sockets cap al navegador.

Això és arquitectura de software: una app no és un únic procés. El catàleg pot ser request-response; el xat no. Hem separat el que escala diferent — cloud, bases de dades, comunicació entre serveis — en lloc d’encabir-ho tot en una sola funció.

El màster parla de monòlit modular, de comunicació síncrona i asíncrona, i d’usar la IA per comparar estils. Aquí la decisió és concreta: Next a Vercel, temps real a Railway, dades a Neon.

---

## 6. El màster, aplicat *(la diapo central)*

**El programa no ensenya “a programar React”. Ensenya a desenvolupar amb IA al centre: prompts, agents, skills i revisió. El stack és el vehicle, no el temari.**

### Fluix amb agents (mòduls 1, 5, 6 i 10)

El mòdul 1 posa la IA al procés d’aprenentatge i al de desenvolupament: filosofia d’ús, Copilot, CLI, ús responsable. El 5 són les eines: IDEs, Codex, models locals, revisió de codi amb IA. El 6 és el fluix: la IA com a part del stack, prompt engineering per a desenvolupadors, **regles i bases de coneixement** — `AGENTS.md`, skills, subagents — i APIs. El 10 és desenvolupament potenciado: projectes fets amb prompts, context, skills i spec-driven development.

A Xarxa Anglesola això no és teoria. He treballat amb Cursor, amb regles de projecte, amb skills — per exemple l’auditoria de seguretat — i amb un fluix spec-driven: primer el criteri o el test, després el mínim que el compleix. La IA accelera; jo decideixo el límit de confiança.

### Enginyeria i arquitectura (mòduls 0, 2 i 3)

El 0 són fonaments: pensament computacional, ecosistema modern, llenguatges, xarxes, bones pràctiques. El 2 és enginyeria: cicle de vida, requisits, paradigmes, principis de disseny i **spec-driven development**. El 3 és arquitectura: estils, Clean Architecture, ports i adaptadors, i sistemes distribuïts.

Al TFM: requisits d’un barri concret, no un e-commerce genèric. Cicle de préstec amb estat. Frontend, API i temps real com a peces amb contractes, no un CRUD generat i abandonat.

### Qualitat i seguretat (mòduls 7 i 9)

El 7 és qualitat: testing, code smells, mètriques, observabilitat, OWASP, documentació amb IA, usabilitat. El 9 és desenvolupament segur: OWASP 2021 i 2025, metodologies, codificació segura, **i ús de la IA en el desenvolupament segur**.

A l’API he aplicat TDD: el test de rebuig abans de la mutació. Vitest al unitari, Playwright a l’e2e. Auditoria de seguretat amb skill, no “confiar el prompt”. Cookies HttpOnly, OAuth sense linking perillós, rate limit per IP real, verificació d’email perquè un registre no ocupi una bústia aliena. La IA proposa; els tests i el model de amenaça tanquen.

### Cloud, IA i producte real (mòduls 4, 8 i 13)

El 4 són fonaments d’IA: generativa, prompting, frameworks, tendències, **IA responsable**. El 8 és infra i cloud: DevOps, CI/CD, cloud, bases de dades, contenidors, i també LangChain, LLMOps i multi-agents — el criteri és saber on viu cada peça, no instal·lar-ho tot. El 13 és aquest projecte: app real, documentada, desplegada, amb slides.

Xarxa Anglesola està a producció: Vercel, Railway, Neon. Tres idiomes. RGPD. Sense desplegament no hi ha TFM, només un prototip local. I prompting responsable vol dir: no posar secrets als prompts, no executar el que l’agent proposa sense sandbox ni tests.

Els mòduls 11 i 12 del temari són bonus i masterclass: productivitat i criteri professional. El que en queda, a la pràctica, és això: entregar, documentar i poder explicar per què cada decisió.

---

## 7. Temps real

**El xat no és un extra: és el pont del préstec.**

Quan reserves, s’obre (o s’enllaça) una conversa privada amb el propietari. Els missatges es guarden a PostgreSQL i es reemeten per Socket.IO. Si canvia l’estat del producte, la resta de clients ho veuen sense recarregar. Si el navegador està tancat, Web Push porta l’avís.

Això és comunicació asíncrona i basada en events, del mòdul d’arquitectura: no tot és un POST i una pàgina nova. El handshake del socket va autenticat; el token no va a la query en producció.

---

## 8. Confiança

**Seguretat i dades personals no són un annex legal: són part del producte.**

Sessió amb cookie firmada, SameSite=lax. Google OAuth. Contrasenyes amb bcrypt. El token del socket es demana per POST. A producció, CSP i HSTS.

RGPD: banner de cookies, pàgines legals, exportar dades i esborrar el compte des de Configuració.

Això lliga el mòdul de seguretat amb el de qualitat i amb IA responsable: un agent que escriu una ruta d’auth sense tests de 401/403 no és “haver aplicat el màster”.

---

## 9. Demo

**Ja es pot fer servir.**

L’app: [xarxanglesola.vercel.app](https://xarxanglesola.vercel.app).  
Codi viu: `MASTER-AI-XRB/XARXANGLESOLA`.  
Còpia acadèmica per lliurar: `MASTER-AI-XRB/TFM`.  
Slides: [xarxanglesola.vercel.app/presentacio](https://xarxanglesola.vercel.app/presentacio).

Si faig demo en viu: registre o login, publicar o veure un producte, reservar, obrir el xat, i si cal el canvi d’idioma i el tema. El que vull que es vegi és el cicle, no totes les pantalles.

---

## 10. Criteri del TFM

**Original, útil i posat a prova.**

- **Real:** fluix complet d’usuari, no només pantalles.  
- **Diferenciador:** préstec veïnal amb estat i xat, no un e-commerce genèric.  
- **Coneixements del màster:** IA aplicada al desenvolupament — agents, skills, spec-driven — més enginyeria, qualitat, seguretat i cloud. No “sé React”.  
- **Valor personal:** una eina per a un barri concret.

El màster és agnòstic de tecnologia. El que es valora és demostrar el que s’ha après construint alguna cosa que es pugui usar. Això és el que he intentat.

---

## 11. Tancament

**La xarxa és la gent. El software només l’ordena.**

Xarxa Anglesola no substitueix el veïnatge: li posa estat, memòria i un canal. El màster m’ha donat la manera de construir-ho amb IA sense deixar de ser responsable del resultat.

Gràcies. Estic obert a preguntes.

---

## Si pregunten

| Pregunta probable | Resposta curta |
|-------------------|----------------|
| Per què no és tot a Vercel? | El Socket.IO necessita procés llarg; Vercel és serverless. Railway hostatja el temps real. |
| Has “deixat que la IA ho faci tot”? | No. Fluix amb agents, però TDD a l’API, auditoria i decisions d’arquitectura explícites. |
| On és l’IA *dins* l’app? | El TFM demostra IA *al desenvolupament*, no un xatbot de producte. El màster va d’això. |
| Què és el snapshot TFM? | `XARXANGLESOLA` és el repo viu; `TFM` és la còpia per avaluar, perquè la producció pot continuar. |
| Tests? | Vitest unitari, Playwright e2e, TDD a rutes sensibles. |
| Seguretat? | OWASP a auth/API, cookies, OAuth sense linking perillós, CSP, RGPD. |

---

## Mapa ràpid: mòdul → on es veu al TFM

| Mòdul | Al projecte |
|-------|-------------|
| 0 Fonaments | TypeScript, git, HTTP, bones pràctiques, pnpm |
| 1 IA al procés | Cursor com a entorn; ús responsable (no secrets als prompts) |
| 2 Enginyeria | Requisits de barri, cicle de préstec, spec-driven / TDD |
| 3 Arquitectura | Web + API + sockets; decisió Vercel vs Railway |
| 4 Fonaments IA | Prompting, skills, IA responsable |
| 5 Eines | Cursor, CLI, revisió assistida |
| 6 Fluix amb IA | `AGENTS.md`, skills, subagents, prompt engineering |
| 7 Qualitat | Vitest, Playwright, usabilitat, i18n, docs |
| 8 Infra i cloud | Vercel, Railway, Neon, Blob, variables d’entorn |
| 9 Seguretat | OWASP, auth, sessions, auditoria |
| 10 Desenvolupament potenciat | Skills, context, SDD, projecte full-stack amb agents |
| 11–12 Bonus / masterclass | Entrega, criteri professional |
| 13 Projecte final | App, README, desplegament, slides |
