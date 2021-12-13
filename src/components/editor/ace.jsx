import { useMemo, useEffect } from 'react';
import AceEditor from 'react-ace';

import { useContext } from "../../utils/context";
import { saveFile } from '../../utils/ftp';

import "ace-builds/webpack-resolver"
import "ace-builds/src-noconflict/ext-prompt";
import "ace-builds/src-noconflict/worker-php";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/snippets/php";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-twig";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-css";

const Editor = () => {
    const { ref, filesOpen, currentFile, currentPath, changeFileOpen, setFilesOpen, message } = useContext();

    const getExt = (path) => {
        if (path == "") return "php";
        const end = path.split(".").slice(-1)[0];
        if (end == "js") return "javascript";
        return end;
    }

    const ext = useMemo(() => getExt(currentPath), [currentPath]);

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
        if (ref.current?.editor == null) return;
        ref.current.editor.session.setScrollTop(currentFile.scrollTop);
        //if(currentFile.session) ref.current.editor.setSession(currentFile.session)
        const element = ref.current.editor.session;
        console.log(element);
        element.addEventListener("keydown", save);
        return () => element.removeEventListener("keydown", save);
    }, [currentFile]);

    useEffect(() => {
    }, []);

    return (
        <>
            <AceEditor
                ref={ref}
                mode={ext}
                theme="dracula"
                fontSize="16px"
                value={currentFile.code ?? ""}
                onChange={changeFileOpen}
                name="UNIQUE_ID_OF_DIV"
                style={{ width: "100%", height: "calc(100% - 40px)" }}
                editorProps={{ $blockScrolling: true }}
                enableBasicAutocompletion={true}
                enableLiveAutocompletion={true}
                enableSnippets={true}
                showPrintMargin={false}
            />
        </>
    )
}
export default Editor;