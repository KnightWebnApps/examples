# Using SvelteKit to build your ChatGPT Plugin Endpoint

<aside>
💡 ChatGPT Plugins are still in beta as of July 9, 2023.  You will need to have access to the beta to test and use your plugin.

</aside>

# Overview

We will simply provide an arbitrary list of todos if the user asks for it. This example is meant to show how to setup a SvelteKit project to start handling requests from OpenAI.

## Specs

First we need to add a openapi.yaml and ai-plugin.json to our project. As per the SvelteKit docs, static assets live in the static folder. So let’s add a /.well-known folder and put the files here.

Our ai-plugin.json will look like this.

```json
{
  "schema_version": "v1",
  "name_for_human": "TODO Lister",
  "name_for_model": "TODOLister",
  "description_for_human": "List arbitrary todos.",
  "description_for_model": "You will list todos when prompted by the user.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "http://localhost:5173/.well-known/openapi.yaml",
    "has_user_authentication": false
  },
  "logo_url": "http://localhost:5173/favicon.png",
  "contact_email": "example@gmail.com",
  "legal_info_url": "http://www.example.com/legal"
}
```

And our openapi.yaml will look like this.

```yaml
openapi: 3.0.1
info:
  title: TODO Lister
  description: A plugin that lists arbitrary todos.
  version: "v1"
servers:
  - url: http://localhost:5173
paths:
  /api/todos:
    get:
      operationId: getTodos
      summary: Get list of tasks.
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#components/schemas/getTodoResponse"
components:
  schemas:
    getTodosResponse:
      type: object
      properties:
        todos:
          type: array
          items:
            type: string
          description: The list of todos.
```

## Endpoint

GPT expects a GET request to live at [http://localhost:5173/api/todos](http://localhost:5173/api/todos). When you are building this out in your own project you will need to specify each endpoints path, operations, and those operations requestBody’s and responses.

This is what our server endpoint will look like.

```tsx
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, request }) => {
  return json(
    { todos: ["Go to the grocery store.", "Build a ChatGPT plugin"] },
    { statusText: "OK", status: 200 }
  );
};
```

## CORS

To allow ChatGPT to access our endpoint we need to change the request headers when their API hits our endpoint. We can do this in our hooks.server.ts file.

```tsx
export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get("origin");

  if (origin && origin === "https://chat.openai.com") {
    // * This needs to be here to allow the request
    if (event.request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }
    event.request.headers.append("Access-Control-Allow-Origin", origin);
    return await resolve(event);
  }
  return await resolve(event);
};
```

### Testing

Last thing we need to do is test it out in the ChatGPT UI.

Start by developing your own plugin, you can follow the official docs [here](https://platform.openai.com/docs/plugins/getting-started/running-a-plugin).

Then simply ask for your todos.

![Screenshot 2023-07-09 at 9.54.19 AM.png](testing-screenshot.png)

### Next Steps

- Auth: If your endpoints require authorization you will need to change your auth strategy for your production plugin
- Get user input: Get data like files, tasks, images, etc. to use in your endpoints
- Improve description_for_model, descriptions and summaries to improve responses from GPT

You can view the full example [here](https://github.com/KnightWebnApps/examples/tree/main/sveltekit-gpt-plugin). Thanks for reading and have a great day!
