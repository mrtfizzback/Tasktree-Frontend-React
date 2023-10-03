import React, { useEffect } from 'react';
import { Tree,  Button, Space  } from 'antd';
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

        // If not dropped into the gap, don't make any changes
      return;
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


  
  const getPosPathArray = (infoNodePos) => {
     const stringArray = infoNodePos.split("-");
     const posArray = stringArray.map(item => parseInt(item));
     //const parentPosition = posArray.pop();
     console.log("POSITION OF PARENT NODE: ", JSON.stringify(posArray));
     return posArray;
  }

  const posPathArray = getPosPathArray(info.node.pos);
  console.log("posPathArray : ", posPathArray);

  const getParentNodeKey = (arr) => {
    const parentPathArray = arr.slice(0,-1);
    console.log("parentPathArray: ", parentPathArray)
    let currentNode = treeState[parentPathArray[1]];
    console.log("Current Node ", currentNode);
    
    const getChildNodes = (node)=>{
      console.log("Children ARRAY", node.children)
      return node.children;
    } 
    

    for(let i=1;i<parentPathArray.length-1;i++)
     {
        currentNode = getChildNodes(currentNode)[parentPathArray[i]];
        console.log(currentNode);
        console.log("CurrentTask: ", currentNode.title);
        console.log("current Key: ", currentNode.key);
        
    }
    console.log("FINAL currentNode", currentNode)
    console.log("FINAL key", currentNode.key)
    return currentNode.key;
}
  


    if(posPathArray.length <=2 && !info.node.dragOver){
      const root = posPathArray[0];
      console.log("ROOT CONDITION")
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${root}`;
    }else if(info.node.dragOverGapBottom && posPathArray.length >2){
      console.log("Entrou na condition dragOverGapBottom")
      console.log("posPathArray dentro da condition: ", posPathArray)
      const theKey= getParentNodeKey(posPathArray);
      
      //const infoNodeKey = getParentNodeKey(nodePos);
      
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${theKey}`;
    } else {
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${dropKey}`;
    }
  

  
  
    try {
      const response = await axios.put(apiUrl);
      console.log(response.data);  // For debugging; can remove after verifying everything works
      setTreeState(data);  // Update the tree state
      console.log("This is the TREE " , JSON.stringify(treeState, null, 2));
        } catch (error) {
      console.error("Error assigning parent task:", error);
    }
  };










  
  return (
    <div> 
      <h1>My Project</h1>
    
    {treeState.length > 0 &&( 
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
