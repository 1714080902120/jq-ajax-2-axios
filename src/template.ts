export function genTemplate(params: Record<string, any>): string {
  const {
    method = "get",
    data = "{}",
    url = "",
    success,
    error,
    complete,
    fail,
  } = params;
  const errParamsName = error?.params || fail?.params || '_err';

  if (fail && fail?.body !== "{}") {
    let body = fail.body.trim();
    fail.body = body.slice(1, body.length - 1);
  }

  if (error && error?.body !== "{}") {
    let body = error.body.trim();
    error.body = body.slice(1, body.length - 1);
  }


  if (success && success?.body != "{}") {
    let body = success.body.trim();
    success.body = body.slice(1, body.length - 1);
  }

  if (complete && complete?.body != '{}') {
    let body = complete.body.trim();
    complete.body = body.slice(1, body.length - 1);
  }

  return `
    async function use_axios() {
      try {
        ${
          success
            ? `let ${
                success.params || "res"
              } = await axios[${method}](${url}, ${
                ["''", '""'].includes(data) ? "{}" : data
              });`
            : ""
        }
        ${success && success?.body != "{}" ? success.body : ""}
      } catch (${errParamsName}) {
        ${fail && fail?.body !== "{}" ? fail.body : ""}
        ${error && error?.body !== "{}" ? error.body : ""}
      } ${
        complete && complete?.body !== "{}"
          ? `finally {
        ${complete.body}
      }`
          : ""
      }
        
    }
  
    use_axios();
  `;
}
