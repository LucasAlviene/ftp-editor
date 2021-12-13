import { useEffect, useMemo, useState, useRef } from "react";
import Editor from "./components/editor";

import File from './components/file';
import Tree from "./components/tree";

import { Context } from './utils/context';
import { createFolder, loadTree, openFile } from './utils/ftp';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const tree = (path, result, list) => {
  Object.entries(result).forEach(([name, result]) => {
    if (isNaN(name)) {
      if (name[0] == ".") return;
      const nextPath = path + name + "/";
      list[nextPath] = [];
      tree(nextPath, result, list);
      list[path].push({ name: capitalize(name), path: nextPath, type: "folder" });
    } else {
      if (result[0] == ".") return;
      list[path].push({ name: result, type: "file", code: "", isEdit: false, path: path + result });
    }
  })
}

const system = window.system;
const root = window.root;

const App = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [treeFiles, setTreeFiles] = useState({"/":[]}); // Cache
  const [currentFolder, setCurrentFolder] = useState("/");
  const [filesOpen, setFilesOpen] = useState({});
  const [loading, setLoading] = useState(false);
  const [msgID, setMsgID] = useState(0);
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
    delete _filesOpen[currentPath];
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

  const create = async() => {
    // path = $(this).attr("data-path");
    
    const name = prompt("Salvar arquivo em: " + system + root + currentFolder);
    if (name) {
      let path = currentFolder+name;
      const _treeFiles = {...treeFiles};
      if (name.indexOf(".") == -1) {
        path += "/";
        const result = await createFolder(currentFolder,name);
        if(result == 1){
          _treeFiles[path] = [];
          _treeFiles[currentFolder].push({ name: capitalize(name), path, type: "folder" });
          setTreeFiles(_treeFiles)
        }
        return false;
      }
      const file = {  name , type: "file", code: "", isEdit: false, path }
      _treeFiles[currentFolder].push(file);
      addFilesOpen(file);
      message('<div class="ui visible warning message"><div class="header">Atenção</div>Esse arquivo não existe, ao salvar o arquivo será criado.</div>', 10000);
      //window.location = "/arquivos?arquivo="+path+'/'+name;
    }
  }


  const currentTree = useMemo(() => treeFiles[currentFolder]?.sort((a) => a.type == "folder" ? -1 : 1) ?? [], [treeFiles, currentFolder]);
  const currentFile = useMemo(() => filesOpen[currentPath] ?? [], [currentPath, filesOpen]);
  const nameFolder = useMemo(() => {
    const a =  currentFolder == "/" ? "Principal" : capitalize(currentFolder.split("/").slice(-2)[0]);
    return a; 
  }, [currentFolder]);
  return (
    <Context.Provider value={{ ref, currentPath, currentFile, filesOpen, changeFolder, addFilesOpen, closeFileOpen, changeFileOpen, setFilesOpen, message }}>
      <div className="ui form" id="arquivoSave">
        <div className="ui grid">
          <div id="left">
            <div className="ui vertical menu" id="menuFiles">
              <div className="header item">SystemHB {(!loading && currentFolder != "/") && <a style={{ cursor: "pointer" }} onClick={backFolder}><i className="reply icon"></i></a>}</div>
              {loading && <i class="notched circle loading icon"></i> || (
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
                <a className="ui item path">{system+root+currentPath ?? ""}</a>
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
/*

$.ajaxSetup({
  timeout:3000
});


Array.prototype.end = function(){
  return this[this.length - 1];
}

const root = "/httpdocs";
      let ftp,currentFile = "",folder = "/";
const menuFile = $("#menuFiles");
const system = "pc";

const listFiles = new Proxy({},{
  get: function(obj, prop){
    if(prop == "length") return Object.keys(obj).length;
    return obj[prop];
  },
  set: function(obj, prop, value) {
    obj[prop] = value;
    menuFiles();
    return true;
  },
  deleteProperty: function(target, prop) {
    if (prop in target) {
      delete target[prop];
      const keys = Object.keys(listFiles);

      if(keys.length > 0 && prop == currentFile){
        const path = keys.end();
        currentFile = path;
        setEditor(listFiles[path],ext(path));
      }else if(keys.length == 0 ){
        setEditor("","php");
      }
      menuFiles();
    }
  }
});

let originCode = "";

const list = async(path) => {
          if(ftp == null) return;
          return await ftp.send("list",{root,path});
      }

      const open = async(path) => {
          if(ftp == null) return;
          return await ftp.send("open",{root,path});
      }

const save = async(path,data) => {
          if(ftp == null) return;
          return await ftp.send("save",{root,path,data});
      }

let f;
      const app = async(callback) => {
          const username = "";
          const password = "";

  ftp = {
    send:async function(type,data){
      return new Promise((resolve, reject) => {
        $.post("/apiv2/arquivos/"+type,data,resolve,"json").fail((data) => {
          reject(data);
          message('<div class="ui visible error message"><div class="header">Erro de Conexão</div></div>');
            console.log(data.responseText);
        });
      });
    }
  }
  callback();

          ftp = new ws();
  await ftp.open();
  try{
    const result = await ftp.send("connect",{username,password});
    console.log("Conectado");
    if(result.data.connect == true){
      message('<div class="ui visible success message"><div class="header">Conectado ao Servidor</div>Serviço <b>aus-sh-ftp</b> conectado, carregando lista.</div>');
      console.log("Conectado");
      callback();
    }else{
      console.warn("Error");
    }
  }catch(e){
    message('<div class="ui visible error message"><div class="header">Erro de Conexão</div>'+e.message+'</div>');
    console.warn("error",e);
  }
      }

var isExpand = false;
if(isExpand) $("body").toggleClass("fullscreen");
menuFile.html("<div class='header item'>SystemHB</div><i class='notched circle loading icon'></i>");

app(() => {
  //setInterval(() => ftp.send("keep",{}),10000);
  listPath();
})

const ext = (path) => path.split(".").end();

const menuFiles = () => {

  let menu = '';
  Object.entries(listFiles).forEach(([path]) => {
    menu += "<a href='"+path+"' class='"+(path == currentFile ? "active" : "")+" item'>"+path.split("/").end()+"  <i class='circle icon'></i><i class='close icon'></i></a>";
  });
  const html = `
    <div class="left menu">
      ${menu}
    </div>
    <div class="right menu">
      <a class="ui item path">${system+root+currentFile}</a>
      <a class="ui item" id="expandCode"><i class='expand icon'></i></a>
    </div>
  `;
  $("#menuTopFiles").html(html);
}

function listPath(){
  menuFile.html("<div class='header item'>SystemHB</div><i class='notched circle loading icon'></i>");
  list(folder).then(({data}) => {
    var back = "<a href='"+data.back+"'><i class='reply icon'></i></a>";
    if(data.back == "") back = "";
    menuFile.html("<div class='header item'>SystemHB "+back+"</div>");
    /*
    Outro


    if(data.version == 2){
      Object.entries(data.folders).map(function(f,key){
        menuFile.append("<div class='item folder'>"+f[0].capitalize()+" <i data-path='"+folder+"/"+f[0]+"' class='plus icon' id='create'></i></div>");
        f[1].map(function(item,key){
          var href = data.path+'/'+f[0]+'/'+item;
          var icon = "<i class='folder outline icon'></i>";
          var name = item.split("/");
          name = name[name.length-1];
          if(href.indexOf(".") > -1){
            icon = "<i class='file icon'></i>";
          }else name = name.capitalize();
          menuFile.append("<a class='item' href='"+href+"'>"+icon+" "+name+"</a>");
        });
      });

    }

    var name = data.path.split("/");
    name = name[name.length-1].capitalize();
    if(name == "") name = "Principal";
    menuFile.append("<div class='item folder'>"+name+" <i data-path='"+folder+"' class='plus icon' id='create'></i></div>");

    const lista = [...data.main.folders,...data.main.files];

    lista.map(function(item,key){
      var href = data.path+"/"+item;
      if(data.path == "/") href = "/"+item;
      var icon = "<i class='folder outline icon'></i>";
      var name = item;
      if(href.indexOf(".") > -1){
        icon = "<i class='file icon'></i>";
      }else name = name.capitalize();
      menuFile.append("<a class='item' href='"+href+"'>"+icon+" "+name+"</a>");
    });
  });
}


$(document).on("mousedown", "#menuFiles>a,#menuFiles>.item>a", function(e) {
  if( e.which == 2 ) {
    e.preventDefault();
    window.open("/arquivos?path="+$(this).attr("href"));
    return false;
  }
}).on("drop",window,function(ev){
  ev.preventDefault();
   if (ev.originalEvent.dataTransfer.items) {
    for (var i = 0; i < ev.originalEvent.dataTransfer.items.length; i++) {
      if (ev.originalEvent.dataTransfer.items[i].kind === 'file') {
      var file = ev.originalEvent.dataTransfer.items[i].getAsFile();
      console.log(file,'... file[' + i + '].name = ' + file.name);
      }
    }
    } else {
    for (var i = 0; i < ev.originalEvent.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.originalEvent.dataTransfer.files[i].name);
    }
    }
}).on("click","#menuFiles #create",function(){
  var path = $(this).attr("data-path");
  var name = prompt("Salvar arquivo em: "+system+root+path);
  if(name){
    if(name.indexOf(".") == -1){
      $.post("/apiv2/arquivos/folder",{root,path,name},function(data){
        if(data.status == 1){
          listPath();
        }
      },"json");
      return false;
    }
    path += "/"+name;
    currentFile = path;
    originCode = listFiles[path] = "";
    setEditor("",ext(path));
    message('<div class="ui visible warning message"><div class="header">Atenção</div>Esse arquivo não existe, ao salvar o arquivo será criado.</div>',10000);
    //window.location = "/arquivos?arquivo="+path+'/'+name;
  }
}).on("click","#menuFiles>a,#menuFiles>.item>a",function(e){
  e.preventDefault();
  e.stopPropagation();
  const href = $(this).attr("href");
  if(href.indexOf(".") == -1){
    folder = href;
    listPath();
  }else{
    open(href).then(({data}) => {
      const file = data;
      //const ext = file.path.split(".")[1];
      currentFile = file.path;
      originCode = listFiles[file.path] = file.result;
      setEditor(file.result,ext(file.path));
    }).catch(console.warn);
  }
  return false;
}).on("click","#menuTopFiles a.item",function(e){
  //e.preventDefault();
  //e.stopPropagation();
  const path = $(this).attr("href");
  if(listFiles[path] != undefined){
       const result = listFiles[path];
    //const ext = path.split(".")[1];
    currentFile = path;
    setEditor(result,ext(path));
    menuFiles();
  }
  return false;
}).on("click","#arquivoSave a.item i.close",function(e){
  e.preventDefault();
  const path = $(this).parent().attr("href");
  delete listFiles[path];
  return false;

}).on("click","#arquivoSave #expandCode",function(){
  $("body").toggleClass("fullscreen");
  isExpand = !isExpand;
  document.cookie = "expand="+isExpand;
}).on("submit", "#arquivoSave", function(e){
  e.preventDefault();
  e.stopPropagation();
  var code = (this.querySelector("textarea[name=\"code\"]").value);
  var loading = message('<div class="ui icon message"><i class="notched circle loading icon"></i><div class="content"><div class="header">Carregando...</div></div></div>',-1);
  const arquivo = root+currentFile;
  save(currentFile,code).then(({data}) => {
    loading.remove();
    if(data.result){
      listFiles[currentFile] = code;
      $("#right .item.active i.circle.active").removeClass("active");
      //setEditor(code,ext(arquivo));
      message('<div class="ui visible success message"><div class="header">Sucesso</div>O arquivo <b>'+arquivo+'</b> foi salvo com sucesso</div>');
    }else{
      message('<div class="ui visible warning message"><div class="header">Erro</div>Não foi possivel salvar o arquivo <b>'+arquivo+'</b>.</div>');
    }
  }).catch(() => {
    loading.remove();
    message('<div class="ui visible warning message"><div class="header">Erro</div>Não foi possivel salvar o arquivo <b>'+arquivo+'</b>.</div>');
  });
});
*/