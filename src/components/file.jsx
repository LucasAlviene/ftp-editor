import { useContext } from "../utils/context";
import Icon from "./icon";

const File = ({ variant, path, name,isEdit, type = "file" }) => {
    const { currentFile, changeFolder, addFilesOpen, closeFileOpen, setContextMenu} = useContext();
    const OnClick = async() => {
        if(type == "folder") return changeFolder(path);
        const file = {name,path,isEdit: false,code: ""};
        addFilesOpen(file,variant == "tree");
    }
    const icon = type == "folder" ? "folder outline icon" : "file icon";
    if (variant == "tree"){
        const handleContextMenu = (e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, path, isFolder: false });
            return;
        }
        return <a onContextMenu={handleContextMenu} className="item file" title={name} onClick={OnClick}><Icon name={name} /> {name}</a>;
    }

    const handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeFileOpen(path);
    }
    return (
        <a onClick={OnClick} title={name} className={"item" + (currentFile.path == path ? " active" : "")}>
            <Icon name={name} />
            {name}
            <i className={"circle icon" + (isEdit ? " active" : "")}></i>
            <i onClick={handleClose} className="close icon"></i>
        </a>
    );
}
export default File;