import { useState, useMemo, useEffect } from 'react';
import { useContext } from '../utils/context';
import Icon from '../components/icon';
import File from './file';

const Item = (props) => {
    /*  if (data.type == "folder") return (
          <>
              {data.children.map((item) => <Item data={item} />)}
          </>
      );
  */
    if (props.type == "folder") return <Folder {...props} />
    return <File variant="tree" isEdit={props.isEdit} path={props.path} name={props.name} type={props.type} />;

}

const Folder = (props) => {
    const [open, setOpen] = useState();
    const { treeFiles, setContextMenu } = useContext();
    const files = useMemo(() => treeFiles[props.path]?.sort((a, b) => a.type == "folder" ? -1 : 1), []);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, path: props.path, isFolder: true });
        return;
    }
    
    return (
        <>
            <a onContextMenu={handleContextMenu} className="item folder" title={props.name} onClick={() => setOpen(!open)}>
                <Icon name={props.name} isOpen={open} /> {props.name}
            </a>
            {open && <div class='treeFolder'>
                {files.map((item, key) => <Item left={props.left} key={key} {...item} />)}

            </div>}
        </>
    );
    // return <File variant="tree" isEdit={data.isEdit} path={data.path} name={data.name} type={data.type}/>;
}

const Tree = ({ data }) => {
    return (
        <>
            {data.map((item, key) => <Item key={key} left="0" {...item} />)}
        </>
    )
}

export default Tree;