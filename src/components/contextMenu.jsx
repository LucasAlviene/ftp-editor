import { useEffect } from "react";
import { useContext } from "../utils/context";
import { createFolder, rename, del } from '../utils/ftp';
import capitalize from '../utils/capitalize';

const system = window.system;
const root = window.root;

const getName = (arr) => {
    if (arr[arr.length - 1] == "") {
        arr.pop();
        //return arr[arr.length - 2];
    }
    return arr[arr.length - 1];
}

const ContextMenu = ({ x, y, path, isFolder }) => {
    const { treeFiles, setContextMenu, message, setTreeFiles, addFilesOpen } = useContext();

    const onClose = (e = null) => {
        if (e) e.preventDefault();
        setContextMenu(false);
    }

    const handleNewFile = () => {
        const name = prompt("Salvar arquivo em: " + system + root + path);
        if (name) {
            let fileName = path + name;
            const _treeFiles = { ...treeFiles };
            const file = { name, type: "file", code: "", isEdit: false, path: fileName }
            _treeFiles[path].push(file);
            addFilesOpen(file);
            message('<div class="ui visible warning message"><div class="header">Atenção</div>Esse arquivo não existe, ao salvar o arquivo será criado.</div>', 10000);
        }
    }

    const handleNewFolder = async () => {
        const name = prompt("Salvar arquivo em: " + system + root + path);
        if (name) {
            let fileName = path + name;
            const _treeFiles = Object.assign({}, treeFiles) //{ ...treeFiles };
            if (name.indexOf(".") == -1) {
                fileName += "/";
                const result = await createFolder(path, name);
                if (result == 1) {
                    _treeFiles[fileName] = [];
                    _treeFiles[path].push({ name: capitalize(name), path: fileName, type: "folder" });
                    setTreeFiles(_treeFiles)
                    message('<div class="ui visible success message"><div class="header">Sucesso</div>Essa pasta foi criada com sucesso.</div>');
                } else {
                    message('<div class="ui visible red message"><div class="header">Error</div>Não foi possivel criar a pasta.</div>');
                }
            }
        }
    }
    const handleListenerClick = (e) => {
        onClose();
    }

    const handleRename = async () => {
        let pathfile = path.split("/");
        let nameDefault = getName(pathfile);
        pathfile.pop();
        pathfile = pathfile.join("/") + "/";

        let isDir = path.indexOf(".") == -1;

        const name = prompt("Salvar arquivo em: " + system + root + pathfile, nameDefault);
        if (name && name != nameDefault) {
            const _treeFiles = Object.assign({}, treeFiles)

            const result = await rename(path, name);

            if (result == 1) {
                if (isDir) {
                    treeFiles[pathfile + name + "/"] = _treeFiles[path];
                    delete _treeFiles[path];
                }
                _treeFiles[pathfile].forEach((item, key) => {
                    if (item.name.toLowerCase() == nameDefault.toLowerCase()) {
                        const old = _treeFiles[pathfile][key];
                        old.name = isDir ? capitalize(name) : name;
                        old.path = pathfile + name;
                        _treeFiles[pathfile][key] = old;
                    }
                })
                setTreeFiles(_treeFiles);
                message('<div class="ui visible success message"><div class="header">Sucesso</div>Esse arquivo/pasta foi renomeado com sucesso.</div>');
            } else {
                message('<div class="ui visible red message"><div class="header">Error</div>Não foi possivel renomear.</div>');
            }
        }
    }

    const handleDelete = async() => {
        if(window.confirm("Tem certeza que deseja apagar esse item? "+path)){
            const _treeFiles = Object.assign({}, treeFiles)
/*
            if (isDir) {
                treeFiles[pathfile + name + "/"] = _treeFiles[path];
                delete _treeFiles[path];
            }
            _treeFiles[pathfile].forEach((item, key) => {
                if (item.name.toLowerCase() == nameDefault.toLowerCase()) {
                    const old = _treeFiles[pathfile][key];
                    old.name = isDir ? capitalize(name) : name;
                    old.path = pathfile + name;
                    _treeFiles[pathfile][key] = old;
                }
            })
            setTreeFiles(_treeFiles);*/
            const result = await del(path);

            if (result == 1) {
                message('<div class="ui visible success message"><div class="header">Sucesso</div>Esse arquivo/pasta foi apagado com sucesso.</div>');
            } else {
                message('<div class="ui visible red message"><div class="header">Error</div>Não foi possivel apagar.</div>');
            }
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleListenerClick)
        return () => document.removeEventListener("click", handleListenerClick);
    })

    return (
        <div className="ui contextmenu">
            <div style={{ top: y, left: x }} className='ui menu vertical'>
                <div className='header item'>{path}</div>
                {isFolder &&
                    <>
                        <a className='item' onClick={handleNewFile}>Novo Arquivo</a>
                        <a className='item' onClick={handleNewFolder}>Nova Pasta</a>
                    </>}
                <a className='item' onClick={handleRename}>Renomear</a>
                <a className='item trash' onClick={handleDelete}><i className='trash icon'></i> Apagar</a>
            </div>
        </div >
    );
}
export default ContextMenu;
/*
return;
let target = e.target;
let i = 0;
while (target != null && target.className != "ui contextmenu") {
    target = target.parentNode;
    i++;
}
if (target == null) {
    console.log("Fecha");
} else {
    console.log("Não fecha");
}
console.log(target, e);*/