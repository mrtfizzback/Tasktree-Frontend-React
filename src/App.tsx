import React, { useEffect } from 'react';
import { Tree } from 'antd';
import { useState } from 'react';
import axios from 'axios';
import type { DataNode, TreeProps } from 'antd/es/tree';


/* const someTreeData = [
  {
    title: 'Node1',
    key: '0-0-0',
    children: [
      {
        title: 'Child Node1',
        key: '0-0-0-1',
      },
    ],
  },
] */

const defaultData: DataNode[] = [];
const App = () => {


  const[treeState, setTreeState]= useState<DataNode[]>([]);
  useEffect(() => {
    

    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:9090/task/tasks"); // Add await here
        const tasks = response.data;
              // Step 1: Create a Set of all child task IDs
      const childTaskIds = new Set();
      tasks.forEach(task => {
        if (task.childTasks) {
          task.childTasks.forEach(childTask => {
            childTaskIds.add(childTask.id);
          });
        }
      });

      const transformTask = (task) => {
        return {
          title: task.title,
          key: task.id.toString(),
          children: task.childTasks ? task.childTasks.map(transformTask) : []
        };
      };

      // Step 2: Map only tasks that are not in the Set of child task IDs
      const transformedData = tasks
        .filter(task => !childTaskIds.has(task.id))
        .map(transformTask);
      
      setTreeState(transformedData);


      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchTasks(); // This invokes the function
  }, []);

  const [gData, setGData] = useState(defaultData);
  // onDragEnter and onDragDrop functions
  const onDragEnter: TreeProps['onDragEnter'] = (info) => {
    console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  

  const onDrop: TreeProps['onDrop'] = async (info) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);


    

    const loop = (
      data: DataNode[],
      key: React.Key,
      callback: (node: DataNode, i: number, data: DataNode[]) => void,
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };
    const data = [...treeState];

    // Find dragObject
    let dragObj: DataNode;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj);
      });
    } else if (
      ((info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    )) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar: DataNode[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj!);
      } else {
        ar.splice(i! + 1, 0, dragObj!);
      }
    }

    let apiUrl;
    if (!info.dropToGap && (info.node.children || []).length === 0 || dropPosition === -1 || info.node.pos.split('-').length <= 2 
    && info.node.dragOverGapBottom ) {
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/0`;
  } else {
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${dropKey}`;
  }

/*   if (info.dropToGap && info.node.pos.split('-').length === 1) {
    apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/0`;
} else if (!info.dropToGap) {
    apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/0`;
} else {
    apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${dropKey}`;
} */
  

    
  
    try {
      const response = await axios.put(apiUrl);
      console.log(response.data);  // For debugging; can remove after verifying everything works
      setTreeState(data);  // Update the tree state
    } catch (error) {
      console.error("Error assigning parent task:", error);
    }
  };



  
  return (
    <div> {treeState.length > 0 &&( 
      <Tree 
      showLine
      //defaultExpandedKeys={['0-0-0']}
      blockNode
      //showIcon={false}

      className="draggable-tree"
      //defaultExpandedKeys={expandedKeys}
      draggable
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={treeState}
      

    />)}
    


    </div>
  );
};

export default App;