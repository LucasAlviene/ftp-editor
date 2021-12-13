import capitalize from './capitalize';
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

export default tree;