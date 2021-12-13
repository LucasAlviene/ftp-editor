import axios from 'axios';
const api = axios.create({
    baseURL: "https://dashboard.aplicupsystem.com",
    //timeout: 1000
    headers: {
      "Content-Type": "application/json"
    },
    withCredentials: true
});

api.interceptors.response.use(({data}) => data, (error) => Promise.reject(error));

const root = window.root;

const loadTree = async() =>{
    const {data} = await api.post("/apiv2/arquivos/tree");
    return data;
}

const openFile = async(path) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);

    const {result} = await api.post("/apiv2/arquivos/open",params).then(({data}) => data);
    return result;
}

const saveFile = async(path,data) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);
    params.append('data', data);

    const {result} = await api.post("/apiv2/arquivos/save",params).then(({data}) => data);
    return result;
}

const createFolder = async(path,name) => {
    const params = new FormData();
    params.append('root', root);
    params.append('path', path);
    params.append('name', name);

    const {status} = await api.post("/apiv2/arquivos/folder",params);
    return status;
}


export {
    loadTree,
    openFile,
    saveFile,
    createFolder
}