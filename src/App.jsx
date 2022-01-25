import { useEffect, useMemo, useState, useRef } from "react";
import Editor from "./components/editor";

import File from './components/file';
import Tree from "./components/tree";
import ContextMenu from './components/contextMenu';
import { Context } from './utils/context';
import { createFolder, loadTree, openFile } from './utils/ftp';
import tree from './utils/tree';
import capitalize from './utils/capitalize';

const system = window.system;
const root = window.root;

const App = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [treeFiles, setTreeFiles] = useState({ "/": [] }); // Cache
  const [currentFolder, setCurrentFolder] = useState("/");
  const [filesOpen, setFilesOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [msgID, setMsgID] = useState(0);
  const [contextMenu,setContextMenu] = useState(false);
  const ref = useRef(null);
  const msgRef = useRef(null);

  const initEditor = async () => {
    const result = await loadTree();
    const list = { "/": [] };
    tree("/", result, list);
    setTreeFiles(list);
    setCurrentFolder("/");
    setLoading(false);

  }

  useEffect(() => {
    initEditor();
  }, []);

  const changeFolder = (path) => {
    setCurrentFolder(path);
  }

  const backFolder = () => {
    if (currentFolder == "/") return;
    const path = currentFolder.split("/");
    path.pop();
    path.pop();
    setCurrentFolder(path.join("/") + "/");
  }

  const addFilesOpen = async (file, isForce) => {
    const _filesOpen = { ...filesOpen };
    if (file.path != currentPath && currentPath != "") {
      //_filesOpen[currentPath].session = ref.current.editor.getSession();
      _filesOpen[currentPath].scrollTop = ref.current.editor.session.getScrollTop();
    }
    if (filesOpen[file.path] === undefined || isForce) {
      file.scrollTop = 0;
      file.code = file.codeOrigin = await openFile(file.path);
      _filesOpen[file.path] = file;
    } else {
      file = filesOpen[file.path];
    }
    setFilesOpen(_filesOpen)
    setCurrentPath(file.path);
  }

  const closeFileOpen = (path) => {
    const file = filesOpen[path];
    if (file.isEdit && !window.confirm("Você não salvou o arquivo, deseja continuar?")) return;
    const _filesOpen = { ...filesOpen };
    delete _filesOpen[path];
    setFilesOpen(_filesOpen);
    if (Object.keys(_filesOpen).length === 0) return setCurrentPath("");
    if (currentPath == path) {
      const newPath = Object.entries(_filesOpen).slice(-1)[0][0];
      setCurrentPath(newPath);
    }
  }

  const changeFileOpen = (code) => {
    if (currentFile == "") return;
    setFilesOpen((old) => {
      const _filesOpen = { ...old };
      const file = _filesOpen[currentPath];
      file.code = code;
      file.isEdit = file.codeOrigin != file.code;
      return _filesOpen;
    })
  }

  const message = (html, time = 3000) => {
    const id = "m" + msgID;
    msgRef.current.insertAdjacentHTML("beforeend", `<div id='${id}'>${html}</div>`);
    setMsgID((old) => old + 1);
    if (time > -1) setTimeout(() => msgRef.current.querySelector("#" + id).remove(), time);
    return msgRef.current.querySelector("#" + id);
  }

  const create = async () => {
    // path = $(this).attr("data-path");

    const name = prompt("Salvar arquivo em: " + system + root + currentFolder);
    if (name) {
      let path = currentFolder + name;
      const _treeFiles = { ...treeFiles };
      if (name.indexOf(".") == -1) {
        path += "/";
        const result = await createFolder(currentFolder, name);
        if (result == 1) {
          _treeFiles[path] = [];
          _treeFiles[currentFolder].push({ name: capitalize(name), path, type: "folder" });
          setTreeFiles(_treeFiles)
        }
        return false;
      }
      const file = { name, type: "file", code: "", isEdit: false, path }
      _treeFiles[currentFolder].push(file);
      addFilesOpen(file);
      message('<div class="ui visible warning message"><div class="header">Atenção</div>Esse arquivo não existe, ao salvar o arquivo será criado.</div>', 10000);
      //window.location = "/arquivos?arquivo="+path+'/'+name;
    }
  }


  const currentTree = useMemo(() => treeFiles[currentFolder]?.sort((a) => a.type == "folder" ? -1 : 1) ?? [], [treeFiles, currentFolder]);
  const currentFile = useMemo(() => filesOpen[currentPath] ?? [], [currentPath, filesOpen]);
  const nameFolder = useMemo(() => {
    const a = currentFolder == "/" ? "Principal" : capitalize(currentFolder.split("/").slice(-2)[0]);
    return a;
  }, [currentFolder]);

  const value = {
    treeFiles,
    ref,
    currentPath,
    currentFile,
    filesOpen,
    contextMenu,
    changeFolder,
    addFilesOpen,
    closeFileOpen,
    changeFileOpen,
    setFilesOpen,
    message,
    setTreeFiles,
    setContextMenu
  }


  return (
    <Context.Provider value={value}>
      {contextMenu && <ContextMenu {...contextMenu} />}
      <div className="ui form" id="arquivoSave">
        <div className="ui grid">
          <div id="left">
            <div className="ui vertical menu fluid" id="menuFiles">
              <div className="header item">SystemHB {(!loading && currentFolder != "/") && <a style={{ cursor: "pointer" }} onClick={backFolder}><i className="reply icon"></i></a>}</div>
              {loading && <i className="notched circle loading icon"></i> || (
                <>
                  <div className="item folder">{nameFolder} <i onClick={create} className="plus icon" id="create"></i></div>
                  <Tree data={currentTree} />
                </>
              )}
            </div>
          </div>
          <div id="right">
            <div className="ui secondary pointing menu" id="menuTopFiles">
              <div className="left menu">
                {Object.entries(filesOpen).map(([, item]) => <File isEdit={item.isEdit} name={item.name} path={item.path} />)}
              </div>
              <div className="right menu">
                <a className="ui item path">{system + currentPath ?? ""}</a>
                <a className="ui item" id="expandCode" onClick={() => document.querySelector("body").classList.toggle("fullscreen")}><i className="expand icon"></i></a>
              </div>
            </div>
            <Editor />
          </div>
        </div>
      </div>
      <div ref={msgRef} id="listMessage"></div>
    </Context.Provider>
  );
}

export default App;
