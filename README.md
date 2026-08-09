# Render Room — puesta en marcha

Tres partes: subir la app, conectar Drive, conectar Meta.
Al final está la discusión sobre cómo se adjudica cada video a su editor,
que conviene leer **antes** de crear las carpetas.

---

## 1 · Subir la app a Vercel

Necesitás una cuenta de GitHub y una de Vercel. Las dos gratis alcanzan.

1. Creá un repositorio nuevo en GitHub y subí esta carpeta entera.
2. En Vercel: **Add New → Project → Import** ese repositorio. Detecta Next.js solo.
3. Antes de darle Deploy, andá a **Storage → Create Database → KV** y conectala
   al proyecto. Vercel inyecta `KV_REST_API_URL` y `KV_REST_API_TOKEN` solo.
4. En **Settings → Environment Variables** agregá:

   | Variable | Valor |
   |---|---|
   | `APP_TOKEN` | una clave larga inventada por vos |
   | `NEXT_PUBLIC_APP_TOKEN` | **la misma** clave |

5. Deploy. En dos minutos tenés una URL tipo `render-room.vercel.app`.

Esa URL se la pasás a los cuatro editores. Ahora sí comparten los datos:
lo que carga uno lo ve el otro.

> **Sobre la seguridad.** `APP_TOKEN` evita que alguien de afuera escriba en tu
> base, pero al ser público en el navegador no es un secreto fuerte. Los PIN de
> la app tampoco son autenticación de verdad: separan roles entre gente de
> confianza, no resisten a alguien que quiera entrar. Para una herramienta
> interna de cinco personas alcanza. Si algún día entra alguien de afuera del
> equipo, hay que poner login real.

---

## 2 · Conectar Google Drive

### 2.1 Crear las credenciales

1. Entrá a `console.cloud.google.com` y creá un proyecto.
2. **APIs y servicios → Biblioteca →** buscá "Google Drive API" y habilitala.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth →**
   tipo **Aplicación de escritorio**. Guardá el *client ID* y el *client secret*.
4. En **Pantalla de consentimiento**, agregá tu cuenta como usuario de prueba.

### 2.2 Sacar el refresh token (una sola vez)

En tu computadora, con Node instalado:

```bash
mkdir tokengoogle && cd tokengoogle
npm init -y && npm install googleapis
```

Creá `token.js`:

```js
const { google } = require('googleapis');
const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const CLIENT_ID = 'pegá-tu-client-id';
const SECRET = 'pegá-tu-client-secret';
const o = new google.auth.OAuth2(CLIENT_ID, SECRET, 'urn:ietf:wg:oauth:2.0:oob');
console.log(o.generateAuthUrl({
  access_type: 'offline', prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
}));
rl.question('Pegá el código: ', async (c) => {
  const { tokens } = await o.getToken(c);
  console.log('REFRESH TOKEN:', tokens.refresh_token);
  rl.close();
});
```

`node token.js` imprime una URL. Abrila, aceptá con la cuenta dueña de la
carpeta, copiá el código que te da y pegalo en la consola. Te devuelve el
refresh token, que no vence salvo que revoques el acceso.

### 2.3 Cargarlo en Vercel

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.
Redesplegá.

### 2.4 Probar

```
https://tu-app.vercel.app/api/drive?folderId=EL_ID_DE_TU_CARPETA
```

El id de la carpeta es lo que va después de `/folders/` en la URL de Drive.
Con el header `x-app-token`. Si devuelve la lista de videos con `segundos`,
`subidoPor` y `carpeta`, quedó andando.

---

## 3 · Conectar Meta

1. `developers.facebook.com` → **Mis aplicaciones → Crear aplicación →**
   tipo **Empresa**.
2. Agregá el producto **Marketing API**.
3. **Herramientas → Explorador de la API Graph**: elegí tu app, pedí los
   permisos `ads_read` y `read_insights`, y generá el token.
4. Ese token dura una hora. Convertilo a uno de larga duración:

```
https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=TU_APP_ID
  &client_secret=TU_APP_SECRET
  &fb_exchange_token=EL_TOKEN_CORTO
```

5. En Vercel: `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` (con el `act_` adelante,
   lo sacás del Administrador de anuncios) y `META_API_VERSION`.

> Verificá cuál es la versión vigente de la API en el portal de
> desarrolladores. Si `v21.0` quedó vieja, cambiá esa variable.

Probar: `https://tu-app.vercel.app/api/meta?desde=2026-08-01&hasta=2026-08-09`

---

## 4 · Cómo se adjudica cada video a su editor

Tu idea es hacerlo por nombre. Funciona, y de hecho la app ya lo hace: cada
entrega recibe un código como `HGRA-MAR-03-FLOW`, donde `MAR` son las
iniciales del editor. Pero conviene ver dónde se rompe antes de apoyar todo
el sistema de pagos ahí.

### El problema del nombre solo

El nombre lo escribe una persona. Si un editor se equivoca en las iniciales,
o copia el nombre de un archivo de un compañero para versionarlo, los minutos
se le acreditan a otro. Y como el mismo código viaja al nombre del anuncio en
Meta, el error se propaga al rendimiento: vas a estar viendo el hook rate de
un editor atribuido a otro. Nadie lo hace a propósito, pero con cuatro
personas y decenas de archivos por semana, pasa.

### Lo que Drive te da gratis

Cuando la API lee la carpeta, cada archivo viene con dos datos que **no se
escriben a mano**:

- `subidoPor` — la cuenta de Google que subió el archivo.
- `carpeta` — la subcarpeta donde está.

Ninguno de los dos se puede equivocar tipeando.

### La recomendación

Usar los tres, en este orden de confianza:

1. **Carpeta por editor.** Dentro de la carpeta de cada brief, una subcarpeta
   por editor: `HGRA/mariana`, `HGRA/bruno`. El editor sube a la suya y listo.
   Es la señal más difícil de arruinar y no depende de que cada uno tenga su
   propia cuenta de Google.
2. **Cuenta que subió el archivo.** Si cada editor entra a Drive con su propia
   cuenta, esto confirma lo anterior y detecta el caso de alguien que subió a
   la carpeta equivocada.
3. **Código en el nombre.** Deja de ser el que adjudica y pasa a ser lo que
   cruza el video con su anuncio en Meta, que es para lo único que hace falta
   un identificador en el texto.

Con eso, si los tres coinciden, la entrega se acredita sola. Si el código dice
`MAR` pero el archivo está en la carpeta de Bruno, la app puede marcarlo para
que lo mires en vez de elegir en silencio.

### Estructura de carpetas sugerida

```
Aelia Creativos/
├── HGRA — Hígado graso/
│   ├── mariana/
│   ├── bruno/
│   └── _referencia/      ← los videos a modelar que subís vos
└── PROS — Próstata/
    ├── sol/
    └── ivo/
```

El endpoint `POST /api/drive` crea carpetas, así que esto se puede automatizar
al crear cada brief.

### Lo que falta

Los tres endpoints funcionan, pero la app todavía no los llama: sigue con la
carga manual y la importación por CSV. Ese último tramo — que la app lea la
carpeta sola, adjudique por carpeta y complete link y duración — es el paso
siguiente, y prefiero escribirlo cuando tengas las credenciales puestas y
podamos probarlo contra tu Drive real en vez de a ciegas.

Cuando tengas la URL de Vercel andando y el `/api/drive` devolviendo tus
archivos, avisame y lo cierro.
