import axios from 'axios';
const api = axios.create({
    baseURL: process.env.REACT_APP_URL_API,
    //timeout: 1000
    headers: {
      "Content-Type": "application/json"
    },
    withCredentials: true
});

api.interceptors.response.use(({data}) => data, (error) => Promise.reject(error));

const root = window.root;
/*
Retorna um array
tree{
    [int] : string
    [string] : [array<tree>]
}
Example:
{
    0: "index.php",
    1: "config.php",
    "dir": {
        0: "functions.php",
        1: "autoload.php",
        "subdir": {
            ....
        }
    }
}
Se deseja mudar a lógica, vá no arquivo utils/tree.js
*/
const loadTree = async() =>{
    const {data} = await api.post("/tree");
    return data;
}

/*
Request: root e path
Response: {
    result: "..."
}
*/
const openFile = async(path) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);

    const {data} = await api.post("/open",params);
    return data.result;
}

/*
Request: root, path and data (code);
Response: {
    status: int (0|1)
}
*/

const saveFile = async(path,data) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);
    params.append('data', data);

    const {status} = await api.post("/save",params);
    return status;
}

/*
Request: root, path and name;
Response: {
    status: int (0|1)
}
*/
console.log(process.env);

const createFolder = async(path,name) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);
    params.append('name', name);

    const {status} = await api.post("/folder",params);
    return status;
}


export {
    loadTree,
    openFile,
    saveFile,
    createFolder
}