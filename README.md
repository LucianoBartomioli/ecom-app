# Render Room — puesta en marcha

Tres partes: subir la app, conectar Drive, conectar Meta.
Al final está la discusión sobre cómo se adjudica cada video a su editor,
que conviene leer **antes** de crear las carpetas.

---

## 1 · Subir la app a Vercel

Necesitás una cuenta de GitHub y una de Vercel. Las dos gratis alcanzan.

1. Creá un repositorio nuevo en GitHub y subí esta carpeta entera.

   > El `.gitignore` ya excluye `.env.local`, cualquier `client_secret*.json`
   > y el propio `sacar-token-google.js` (viene con el secreto adentro),
   > así que las credenciales **no** viajan al repositorio. Están en
   > `.env.local` para que puedas probar en tu máquina, y las mismas van
   > cargadas a mano en Vercel. Nunca las pongas en un archivo que se suba.
2. En Vercel: **Add New → Project → Import** ese repositorio. Detecta Next.js solo.
3. Antes de darle Deploy, creá la base. **Vercel KV ya no existe**: ahora se
   instala desde el marketplace. Andá a **Storage** y de la lista de proveedores
   elegí **Upstash → Redis**. Creá la base y conectala al proyecto: inyecta
   `KV_REST_API_URL` y `KV_REST_API_TOKEN` solas, que son las que espera el
   código. El plan gratuito alcanza de sobra.

   > Las otras opciones de esa lista no sirven acá: Neon, Supabase, Prisma y
   > Nile son Postgres, y la integración "Redis" oficial se conecta por TCP,
   > que una función serverless no puede usar. Upstash habla por HTTP, que es
   > lo que necesitamos.
   >
   > Si por lo que sea las variables quedan con otro nombre, cargá a mano
   > `STORAGE_REST_URL` y `STORAGE_REST_TOKEN` con la URL y el token REST que
   > te muestra el panel de tu proveedor. El código también los acepta.
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

Hay dos caminos. Leé los dos párrafos y elegí; después seguí solo esa sección.

**Cuenta de servicio (recomendado).** Una identidad que le pertenece al
servidor, no a una persona. Le compartís la carpeta de Drive como si fuera un
compañero de trabajo. No hay navegador, no hay pantalla de consentimiento y no
hay token que venza. Es lo correcto para algo que corre solo en un servidor.

**OAuth con tu cuenta.** El método clásico. Requiere abrir el navegador y
aceptar una vez. **Cuidado:** mientras tu app esté en modo *Testing* en la
consola de Google, el refresh token vence a los 7 días y hay que rehacer el
paso. Para que no venza tenés que publicar la app en producción.

---

### 2·A · Cuenta de servicio

1. `console.cloud.google.com` → tu proyecto → **APIs y servicios → Biblioteca**
   → habilitá **Google Drive API**.
2. **Credenciales → Crear credenciales → Cuenta de servicio.** Ponele un
   nombre, por ejemplo `render-room`. No hace falta darle roles.
3. Entrá a la cuenta creada → pestaña **Claves → Agregar clave → Crear clave
   nueva → JSON.** Se descarga un archivo.
4. Copiá el `client_email` de ese archivo. Es algo como
   `render-room@tu-proyecto.iam.gserviceaccount.com`.
5. En Drive, botón derecho sobre tu carpeta de creativos → **Compartir** →
   pegá ese email → permiso **Lector** (o **Editor** si querés que la app
   pueda crear las subcarpetas de cada brief).
6. En Vercel, creá la variable `GOOGLE_SERVICE_ACCOUNT_JSON` y pegá el
   contenido del archivo JSON entero, en una sola línea.

Listo. No hay más pasos.

> Una cuenta de servicio no tiene espacio propio en Drive, así que sirve para
> leer la carpeta y crear subcarpetas dentro de lo que le compartiste, pero no
> para ser dueña de archivos en tu Mi Unidad. Para lo que necesitamos —leer los
> videos, sus duraciones y quién los subió— alcanza y sobra.

---

### 2·B · OAuth con tu cuenta

1. En la consola: **Credenciales → Crear credenciales → ID de cliente de OAuth**
   → tipo **Aplicación de escritorio**.
2. En la **pantalla de consentimiento**, agregá tu cuenta en *Usuarios de
   prueba*. Sin eso, Google rechaza el acceso.
3. Poné `sacar-token-google.js` (viene en este paquete) en una carpeta y corré:

   ```bash
   node sacar-token-google.js
   ```

   No instala nada; solo necesita Node 18 o superior. Ya viene con el
   `client_id` y el `client_secret` cargados, así que ni siquiera hace falta
   el JSON al lado. Si ponés el JSON en la misma carpeta, usa ese.

4. Imprime una URL. Abrila, entrá con la cuenta **dueña de la carpeta** y
   aceptá. Te devuelve el `GOOGLE_REFRESH_TOKEN`.
5. Cargá en Vercel `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y
   `GOOGLE_REFRESH_TOKEN`.

> **El vencimiento a los 7 días.** Si en la consola tu app figura como
> *Testing*, Google caduca el refresh token cada 7 días y la conexión se corta.
> Para evitarlo, andá a la pantalla de consentimiento y pasala a **Producción**.
> Como el permiso de Drive es sensible y la app no está verificada, vas a ver
> una advertencia al autorizar: entrás igual desde *Configuración avanzada →
> Ir a (nombre de la app)*. Hasta 100 usuarios no necesita verificación.
>
> El flujo viejo `urn:ietf:wg:oauth:2.0:oob` que aparece en tutoriales viejos
> ya no funciona: Google lo discontinuó. El script usa loopback sobre
> `http://localhost:53682`, que es el que corresponde.

---

### 2·C · Que los editores suban sin tener cuenta de Google

Esto ya está construido. La app abre la subida con **tus** credenciales, así
que el archivo queda en tu carpeta, es tuyo y consume tu plan. El editor no
necesita cuenta de Google ni acceso a tu Drive: solo entra a la app.

Cómo funciona por dentro: el navegador del editor le pide al servidor una
sesión de subida, y con esa dirección manda los bytes **directo a Google**. El
servidor nunca toca el archivo — es obligatorio, porque una función de Vercel
no puede recibir 200 MB ni quedarse diez minutos esperando. Si se corta la
conexión, la subida retoma desde donde quedó en vez de empezar de nuevo.

Falta una variable:

| Variable | Valor |
|---|---|
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | el id de tu carpeta madre de creativos |

El id es lo que va después de `/folders/` en la URL de Drive.

Dentro de esa carpeta, la app arma sola la estructura:

```
Creativos/
├── HGRA — Hígado graso/
│   ├── Mariana/
│   └── Bruno/
└── PROS — Próstata/
    └── Sol/
```

**Esto cierra la discusión de la adjudicación.** Como el que sube es el
servidor, ya sabe qué editor está logueado y lo deposita en su carpeta. No
depende de que nadie escriba bien el nombre del archivo ni de qué cuenta usó.
El código en el nombre queda solo para cruzar con Meta, que es para lo único
que hacía falta.

> **Importante para las subidas.** Una cuenta de servicio no tiene espacio
> propio en Drive: sirve para leer, pero al subir a tu Mi Unidad Google la
> rechaza por cuota. Para que los editores suban tenés dos opciones:
> usar el camino **2·B (OAuth con tu cuenta)**, que es lo más simple y hace que
> los archivos sean tuyos y consuman tu plan; o mover la carpeta a una
> **unidad compartida** de Google Workspace, donde los archivos pertenecen a la
> unidad y la cuenta de servicio sí puede escribir.
>
> Si tu plan de 200 TB es Workspace, la unidad compartida es lo mejor de los dos
> mundos: sin vencimiento de token y sin problema de cuota. Si es Google One
> personal, andá por OAuth y pasá la app a producción para que el token no
> caduque a los 7 días.

### 2·D · Probar que quedó andando

Primero la base, que es de lo que depende todo lo demás:

```
https://tu-app.vercel.app/api/storage?estado&token=TU_APP_TOKEN
```

Escribe una clave de prueba, la lee, la borra y te dice de dónde sacó las
credenciales. Si responde `"escrituraYLectura": "funcionan"`, la base está lista.

Qué método detectó:

```
https://tu-app.vercel.app/api/drive?estado
```

Los videos de una carpeta:

```
https://tu-app.vercel.app/api/drive?folderId=EL_ID
```

Desde el navegador, agregale tu clave al final: `&token=TU_APP_TOKEN`
(o `?token=` si es el primer parámetro). Si devuelve la lista con `segundos`,
`subidoPor` y `carpeta`, está conectado.

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
