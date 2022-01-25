import capitalize from './capitalize';
const tree = (path, result, list) => {
    Object.entries(result).forEach(([name, item]) => {        
        if (item.isDir) {
            if (item.name[0] == ".") return;
            const nextPath = path + item.name + "/";
            list[nextPath] = [];
            tree(nextPath, item.children, list);
            list[path].push({ name: capitalize(item.name), path: nextPath, type: "folder" });
        } else {
            if (item.path[0] == ".") return;
            list[path].push({ name: item.path, type: "file", code: "", isEdit: false, path: path + item.path });
        }
    })
}

export default tree;