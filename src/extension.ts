import * as vscode from "vscode";

import * as parser from "@babel/parser";
import {
  ObjectProperty,
  Identifier,
  isArrowFunctionExpression,
  isFunctionExpression,
} from "@babel/types";
import * as traverse from "@babel/traverse";
import * as generator from "@babel/generator";
import { genTemplate } from "./template";

interface FuncType {
  body: string;
  isAsync: boolean;
  params: string;
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "jq-ajax-2-axios.transform",
    () => {
      // 当前获取编辑器
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const allSelection = editor.selection;
      let start = new vscode.Position(allSelection.start.line, 0);
      let end = new vscode.Position(
        allSelection.end.line,
        99999999999999999999999999999999
      );
      let range = new vscode.Range(start, end);

      // 获取选择的那段文本
      const text = editor.document.getText(range);
      let textTrim = text.trim();

      try {
        const parseResult = parser.parse(textTrim);

        let method = "get";
        let url = "";
        let data = null;
        let success = null;
        let error = null;
        let complete = null;
        let fail = null;

        const targetObjPropDict: Record<string, any> = {
          type: (type: string) => {
            method = type;
          },
          data: (_data: any) => {
            data = _data;
          },
          url: (_url: string) => {
            url = _url;
          },
          error: (param: FuncType) => {
            error = param;
          },
          success: (param: FuncType) => {
            success = param;
          },
          complete: (param: FuncType) => {
            complete = param;
          },
          fail: (param: FuncType) => {
            fail = param;
          },
        };

        traverse.default(parseResult, {
          // 获取必要的几个数据
          ObjectProperty(path) {
            let node: ObjectProperty = path.node;
            let key = node.key as Identifier;
            let fn = targetObjPropDict[key.name];
            if (fn) {
              let value = node.value;
              // () => {} or function () {}
              if (
                isArrowFunctionExpression(value) ||
                isFunctionExpression(value)
              ) {
                let params = value.params;
                let body = value.body;
                let isAsync = value.async;

                fn({
                  isAsync,
                  body: generator.default(body).code,
                  params: generator.default(params[0]).code,
                });
              } else {
                const res = generator.default(value);
                fn(res.code);
              }
            }
          },
          ObjectMethod(path) {
            let node = path.node as any;
            let key = node.key;
            let params = node.params;
            let fn = targetObjPropDict[key.name];
            if (fn) {
              let isAsync = node.async;
              let body = node.body;
              params = generator.default(params[0]).code;

              body = generator.default(body).code;

              fn({
                params,
                isAsync,
                body,
              });
            }
          },
        });

        const { reg_str = [], axios_path = '', axios_alias = '' } = vscode.workspace.getConfiguration("jq_ajax_2_axios.config") || {};
  
        const template = genTemplate({
          method,
          data,
          url,
          success,
          error,
          complete,
          fail,
          reg_str,
          axios_path,
          axios_alias,
        });

        editor.edit((editBuilder) => {
          editBuilder.replace(range, template);
        });
      } catch (error) {
        throw new Error((error as string) || "tranform error");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
