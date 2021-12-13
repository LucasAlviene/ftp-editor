import { useContext } from "../utils/context";

const File = ({ variant, path, name,isEdit, type = "file" }) => {
    const { currentFile, changeFolder, addFilesOpen, closeFileOpen} = useContext();
    const OnClick = async() => {
        if(type == "folder") return changeFolder(path);
        const file = {name,path,isEdit: false,code: ""};
        addFilesOpen(file,variant == "tree");
    }
    const icon = type == "folder" ? "folder outline icon" : "file icon";
    if (variant == "tree") return <a className="item" onClick={OnClick}><i className={icon}></i> {name}</a>;

    const handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeFileOpen(path);
    }
    return (
        <a onClick={OnClick} className={"item" + (currentFile.path == path ? " active" : "")}>
            {name}
            <i className={"circle icon" + (isEdit ? " active" : "")}></i>
            <i onClick={handleClose} className="close icon"></i>
        </a>
    );
}
export default File;