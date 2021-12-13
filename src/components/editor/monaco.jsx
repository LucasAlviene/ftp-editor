import { useMemo, useEffect } from 'react';
import Monaco from "@monaco-editor/react";

import { useContext } from "../../utils/context";
import { saveFile } from '../../utils/ftp';
import Dracula from './dracula.json';

const Editor = () => {
    const { ref, currentFile, currentPath, changeFileOpen, setFilesOpen, message } = useContext();

    const ext = useMemo(() => {
        if (currentPath == "") return "php";
        const end = currentPath.split(".").slice(-1)[0];
        if (end == "js") return "javascript";
        return end;
    }, [currentPath]);

    const save = async (e) => {
        if (e.keyCode == 83 && e.ctrlKey == true) {
            const loading = message('<div class="ui icon message"><i class="notched circle loading icon"></i><div class="content"><div class="header">Carregando...</div></div></div>', -1);
            e.preventDefault();
            e.stopPropagation();
            loading.remove();
            if (currentPath == "") return false;
            if (await saveFile(currentFile.path, currentFile.code)) {
                setFilesOpen((old) => {
                    const _filesOpen = { ...old };
                    _filesOpen[currentPath].isEdit = false;
                    _filesOpen[currentPath].codeOrigin = currentFile.code;
                    return _filesOpen;
                })
                message('<div class="ui visible success message"><div class="header">Sucesso</div>O arquivo <b>' + currentPath + '</b> foi salvo com sucesso</div>');
            } else {
                message('<div class="ui visible warning message"><div class="header">Erro</div>Não foi possivel salvar o arquivo <b>' + currentPath + '</b>.</div>');
            }
            return false;
        }
    }

    useEffect(() => {
        //ref.current.editor.session.setScrollTop(currentFile.scrollTop);
        if (ref.current == null) return;
        const element = ref.current;
        element.addEventListener("keydown", save);
        return () => element.removeEventListener("keydown", save);
    }, [currentFile]);

    useEffect(() => {
    }, []);

    return (
        <div ref={ref} style={{ width: "100%", height: "100%" }}>

            <Monaco
                theme={"dracula"}
                height="calc(100% - 40px)"
                language={ext}
                path={currentFile?.path ?? ""}
                value={currentFile?.code ?? ""}
                onChange={changeFileOpen}
                beforeMount={async (monaco) => {
                    // monaco.languages.getLanguages().filter((item) => item.id == "php")[0].loader().then((data) => console.log(data));
                    monaco.languages.registerDocumentSymbolProvider('php', {
                        provideDocumentSymbols: (model, token) => {
                            return [
                                {
                                    range: {
                                        startLineNumber: 10,
                                        startColumn: 1,
                                        endLineNumber: 20,
                                        endColumn: 2
                                    },
                                    name: 'File',
                                    kind: 0,
                                    detail: 'Abre o arquivo?',
                                    tags: ["123"],
                                    children:[
                                        {
                                            name: "123",
                                            kind: 1,
                                            detail: '',
                                            range: {
                                                startLineNumber: 10,
                                                startColumn: 1,
                                                endLineNumber: 20,
                                                endColumn: 1
                                            },
                                            selectionRange: {
                                                startLineNumber: 10,
                                                startColumn: 1,
                                                endLineNumber: 20,
                                                endColumn: 1
                                            }
                                        }
                                    ],
                                    selectionRange: {
                                        startLineNumber: 10,
                                        startColumn: 1,
                                        endLineNumber: 20,
                                        endColumn: 1
                                    }
                                }
                            ]
                        }
                    });
                    monaco.languages.registerDefinitionProvider("php",{
                        provideDefinition: function(model,token){
                            
                            console.log(model,token);
                            return {
                                uri: ("dashboard.aplicupsystem.com/arquivos/projeto"),
                                range: new monaco.Range(0,0,1,2)
                            }
                        }
                    })
                    console.log(Dracula);
                    try{

                        monaco.editor.defineTheme("dracula", Dracula);
                    }catch(e){
                        console.log(e.message);
                    }
                }}
                onMount={(editor, monaco) => {
                    //console.log(new monaco.Uri("dashboard.aplicupsystem.com/arquivos/projeto"));
                    //console.log(editor.getAction('editor.action.format'));

                    /*
                    monaco.languages.registerHoverProvider("php", {
                        provideHover: () => (
                            {
                                contents: [
                                    {
                                        value: "Teste <b>1</b>",
                                        supportThemeIcons: true,
                                        supportHtml: true,                                    }
                                ]
                            }
                        )
                    })

                    /*
                    monaco.languages.registerCompletionItemProvider('php', {
                        provideCompletionItems: function (model, position) {
                            // find out if we are completing a property in the 'dependencies' object.
                            var textUntilPosition = model.getValueInRange({
                                startLineNumber: 1,
                                startColumn: 1,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column
                            });
                            var word = model.getWordUntilPosition(position);
                            var range = {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endColumn: word.endColumn
                            };
                            return {
                                suggestions: Array.from(Array(28).keys()).map((i) => ({
                                    label: '"lodash0' + i + '"',
                                    kind: i,
                                    documentation: 'The Lodash library exported as Node.js modules.',
                                    insertText: '"lodash": "' + i + '"',
                                    range: range
                                }))
                                /*[
                                    {
                                        label: '"lodash"',
                                        kind: monaco.languages.CompletionItemKind.Function,
                                        documentation: 'The Lodash library exported as Node.js modules.',
                                        insertText: '"lodash": "*"',
                                        range: range
                                    },
                                    {
                                        label: '"express"',
                                        kind: monaco.languages.CompletionItemKind.Color,
                                        documentation: 'Fast, unopinionated, minimalist web framework',
                                        insertText: '"express": "*"',
                                        range: range
                                    },
                                    {
                                        label: '"mkdirp"',
                                        kind: monaco.languages.CompletionItemKind.Function,
                                        documentation: 'Recursively mkdir, like <code>mkdir -p</code>',
                                        insertText: '"mkdirp": "*"',
                                        range: range
                                    },
                                    {
                                        label: '"my-third-party-library"',
                                        kind: monaco.languages.CompletionItemKind.Function,
                                        documentation: 'Describe your library here',
                                        insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
                                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                        range: range
                                    }
                                ]*
                            };
                        }
                    });
                    */
                    editor.addAction({
                        id: "formatCode",
                        label: "Formatar Código",
                        precondition: null,

                        // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
                        keybindingContext: null,

                        contextMenuGroupId: 'navigation',

                        contextMenuOrder: 1.5,
                        keybindings: [
                            monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
                        ],
                        run: (e) => {
                            editor.getAction('editor.action.format').run()
                            console.log(e);
                        }
                    })
                    // ref.current = editor;
                }}
                onValidate={(markers) => {
                    console.log(markers);
                }}
                options={{
                    linkedEditing: true
                }}
            />
        </div>
    )
}
export default Editor;