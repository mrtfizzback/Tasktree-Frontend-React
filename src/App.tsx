import React, { useState, useEffect } from "react";
import { Tree, Button, Space } from "antd";
import axios from "axios";
import type { DataNode, TreeProps } from "antd/es/tree";
import {
  Modal,
  Form,
  Input,
  Select,
  Breadcrumb,
  Layout,
  Menu,
  theme,
} from "antd";
import { ResizableBox } from "react-resizable";
/* import 'react-resizable/css/styles.css'; */
import "./App.css";
import { BrowserRouter, Routes, Route, Link, Router } from "react-router-dom";
import TesteComponent from "./components/TesteComponent.jsx";
import { store } from "./reduxStore/store";
import { Provider, useSelector } from "react-redux";

import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Login2 from "./components/Login2.tsx";
import Register from "./components/Register";
import Profile from "./components/Profile";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const { Header, Content, Footer, Sider } = Layout;

//Some tree data to test the tree drag-n-drop
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
  // Current logged in User on ReduxStore
  const user = useSelector((state) => state.user);
  const token = user.accessToken;
  const roles = user.roles;
  console.log("-----REDUX STORE USER: ", user);
  console.log("TOKEN: ", token);

  // Treestate with fetched tasks fron databse
  const [treeState, setTreeState] = useState<DataNode[]>([]);

  //Users as options fro the taskManager selection
  const [users, setUsers] = useState([]);
  /* const[currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
  }; */

  //logout and reset useStates
  const logoutAndReset = () => {
    AuthService.logout();
    setUsers([]);
    setTreeState([]);
  };

  const fetchTasks = async () => {
    try {
      /* const response = await axios.get("http://localhost:9090/task/tasks"); */

      const response = await axios.get("http://localhost:9090/task/tasks", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      console.log("AXIOS TASKS request: ", response);
      const tasks = response.data;
      console.log("AXIOS GET fetchtasks: ", tasks);

      // 1: I need to create a Set of all child task IDs
      //Create a set of tasks that are not childtasks to be on root of tree and distinguish from childtasks,
      //or else childtasks will appear more than onece on the tree
      const childTaskIds = new Set();
      tasks.forEach((task) => {
        if (task.childTasks) {
          task.childTasks.forEach((childTask) => {
            childTaskIds.add(childTask.id);
          });
        }
      });

      const transformTask = (task) => {
        return {
          title: task.title,
          key: task.id.toString(),
          taskDescription: task.taskDescription,
          taskType: task.taskType != null ? task.taskType : "null",
          taskManager:
            task.taskManager != null
              ? task.taskManager.userName
              : "No Manager assigned",
          creationDate: task.creationDate,
          lastEditedDate: task.lastEditedDate,
          isCompleted: task.isCompleted,
          taskOrder: task.taskOrder,
          taskLevel: task.taskLevel,
          children: task.childTasks ? task.childTasks.map(transformTask) : [],
        };
      };

      // 2: Mapping only tasks that are not in the Set of child task IDs
      const transformedData = tasks
        //only tasks that are not child tasks
        .filter((task) => !childTaskIds.has(task.id))
        //transformTask maps all childtasks
        .map(transformTask);

      setTreeState(transformedData);
      console.log("TREESTaTE", treeState);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      /* const response = await axios.get("http://localhost:9090/user/users") */

      /*         const response = await axios.get("http://localhost:9090/user/users",  {
          headers: {
            Authorization: 'Bearer ' + token
          }
        }); */

      const response = await axios.get("http://localhost:9090/auth/allusers", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      console.log("---TOKEN success fetchusers: ", token);
      console.log("AXIOS USERRSSSSS: ", response);
      const fetchedUsers = response.data;
      const transformedUsers = fetchedUsers.map((user) => ({
        id: user.id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        password: user.password,
        userType: user.userType,
        managingTasks: [],
        partOfTeamTasks: [],
      }));
      setUsers(fetchedUsers);
      console.log("USER LIST:", fetchedUsers);
    } catch (error) {
      console.error("NOOO USSSERRSSSS", error);
      console.log("---TOKEN error fetchusers: ", token);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUsers();
    }
  }, [token]);

  //const [gData, setGData] = useState(defaultData);
  // onDragEnter and onDragDrop functions
  const onDragEnter: TreeProps["onDragEnter"] = (info) => {
    console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop: TreeProps["onDrop"] = async (info) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: DataNode[],
      key: React.Key,
      callback: (node: DataNode, i: number, data: DataNode[]) => void
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
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
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

    //Path array taken from info.node.pos
    const getPosPathArray = (infoNodePos) => {
      const stringArray = infoNodePos.split("-");
      const posArray = stringArray.map((item) => parseInt(item));
      //const parentPosition = posArray.pop();
      console.log("POSITION OF PARENT NODE: ", JSON.stringify(posArray));
      return posArray;
    };

    const posPathArray = getPosPathArray(info.node.pos);
    console.log("posPathArray : ", posPathArray);

    // Function to use only for the condition: dragOverGapBottom is true
    const getParentNodeKey = (arr) => {
      const parentPathArray = arr.slice(0, -1);
      console.log("parentPathArray: ", parentPathArray);
      let currentNode = treeState[parentPathArray[1]];
      console.log("Current Node ", currentNode);

      const getChildNodes = (node) => {
        console.log("Children ARRAY", node.children);
        return node.children;
      };

      for (let i = 1; i < parentPathArray.length - 1; i++) {
        currentNode = getChildNodes(currentNode)[parentPathArray[i]];
        console.log(currentNode);
        console.log("CurrentTask: ", currentNode.title);
        console.log("current Key: ", currentNode.key);
      }
      console.log("FINAL currentNode", currentNode);
      console.log("FINAL key", currentNode.key);
      return currentNode.key;
    };

    if (posPathArray.length <= 2 && !info.node.dragOver) {
      const root = posPathArray[0];
      console.log("ROOT CONDITION");
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${root}`;
    } else if (info.node.dragOverGapBottom && posPathArray.length > 2) {
      console.log("Entered the condition dragOverGapBottom");
      console.log("posPathArray dentro da condition: ", posPathArray);
      const theKey = getParentNodeKey(posPathArray);
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${theKey}`;
    } else {
      apiUrl = `http://localhost:9090/task/assignparent/${dragKey}/${dropKey}`;
    }

    try {
      /*       const response = await axios.put(apiUrl, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      }) */
      const response = await axios.put(apiUrl);

      console.log(response.data);
      fetchTasks();
      setTreeState(data); // Update the tree state
      console.log("This is the TREE ", JSON.stringify(treeState, null, 2));
    } catch (error) {
      console.error("Error assigning parent task:", error);
    }
  };

  // Modal form handler function and state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const [form] = Form.useForm();
  const handleFormSubmitNewTask = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      /*       const response = await axios.post(`http://localhost:9090/task/newtask`, {
            title: values.title,
            taskDescription: values.taskDescription,
            taskType: values.taskType,
            manager: values.manager
        }, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }); */

      const response = await axios.post(
        `http://localhost:9090/task/newtask`,
        {
          title: values.title,
          taskDescription: values.taskDescription,
          taskType: values.taskType,
          taskManager: values.manager,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      console.log("NEW TASK RESPONSE: ", response);

      /* console.log("AXIOS.POST RESPONSE: ", response)
      console.log("AXIOS RESPONSE.DATA: ", response.data) */
      if (response.status == 200) {
        console.log("Task created successfully!");
      } else {
        console.error(
          "Error from the server with STATUS: ",
          response.status || "No error message provided by server"
        );
      }
    } catch (error) {
      console.error("Failed to submit new item form:", error);
    }
    fetchTasks();
    fetchUsers();
  };

  const deleteTask = async (taskid) => {
    try {
      const response = await axios.delete(
        `http://localhost:9090/task/${taskid}`
      );
      console.log(response);
      fetchTasks();
    } catch (error) {
      console.log("DELETE TASK ERROR!!");
    }
  };

  // Task Panel state
  const [selectedTask, setSelectedTask] = useState<DataNode>();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <Provider store={store}>
      <div className='app-wrapper'>
        <Header
          className='header'
          style={{ display: "flex", alignItems: "center" }}>
          <Link className='tasktree-logo' to='/home'>
            <h3 className='logo'>Tasktree</h3>
          </Link>
          <div className='user-info'>
            {user.accessToken != null ? (
              <>
                <div className='user-wrapper'>
                  <FontAwesomeIcon icon={faUser} className='profile-icon' />
                  <h2 className='userName'>{user.userName}</h2>
                  <Button onClick={logoutAndReset}>Logout</Button>
                </div>
              </>
            ) : (
              <>
                <Link className='login-button' to='/login'>
                  <Button>Login | Register</Button>
                </Link>
              </>
            )}
          </div>
        </Header>
        <Routes>
          <Route path='/login2' element={<TesteComponent />} />
          <Route path='/login' element={<Login2 />} />
          <Route
            path='/home'
            element={
              <>
                <div style={{ display: "flex", height: "100vh" }}>
                  {/* Left Container */}
                  <div className='left-content-wrapper'>
                    <h1>My Project</h1>
                    {roles == "ROLE_ADMIN" && (
                      <Button
                        style={{ marginBottom: "20px" }}
                        type='primary'
                        onClick={() => setIsModalVisible(true)}>
                        New Task
                      </Button>
                    )}
                    <Modal
                      title='Add New Task'
                      open={isModalVisible}
                      onOk={() => {
                        handleFormSubmitNewTask();
                        setIsModalVisible(false);
                      }}
                      onCancel={() => setIsModalVisible(false)}>
                      <Form form={form}>
                        <Form.Item label='Task Title' name='title'>
                          <Input placeholder='Enter task title' />
                        </Form.Item>
                        <Form.Item
                          label='Task Description'
                          name='taskDescription'>
                          <Input.TextArea placeholder='Enter task description' />
                        </Form.Item>
                        <Form.Item label='Task Type' name='taskType'>
                          <Select placeholder='Choose task type'>
                            <Select.Option value='FOLDER'>Folder</Select.Option>
                            <Select.Option value='TASK'>Task</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item label='Task Manager' name='manager'>
                          <Select placeholder='Assign item manager'>
                            {users.map((user) => (
                              <Select.Option
                                key={user.id}
                                value={user.userName}>
                                {user.userName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Form>
                    </Modal>

                    <div>
                      {treeState.length > 0 &&
                        (user.roles === "ROLE_ADMIN" ? (
                          <Tree
                            showLine
                            draggable
                            onDragEnter={onDragEnter}
                            onDrop={onDrop}
                            treeData={treeState}
                            onSelect={(selectedKeys, info) => {
                              setSelectedTask(info.node);
                              setIsPanelOpen(true);
                            }}
                          />
                        ) : (
                          <Tree
                            showLine
                            onDragEnter={onDragEnter}
                            onDrop={onDrop}
                            treeData={treeState}
                            onSelect={(selectedKeys, info) => {
                              setSelectedTask(info.node);
                              setIsPanelOpen(true);
                            }}
                          />
                        ))}
                    </div>
                  </div>
                  {/* Right Side Panel */}
                  <div
                    className='right-panel'
                    style={{ borderLeft: "2px solid #ccc", padding: "40px" }}>
                    {selectedTask ? (
                      <>
                        <h2>{selectedTask.title}</h2>
                        <p>
                          <strong>Description:</strong>{" "}
                          {selectedTask.taskDescription}
                        </p>
                        <p>
                          <strong>Type:</strong> {selectedTask.taskType}
                        </p>
                        <p>
                          <strong>Manager:</strong> {selectedTask.taskManager}{" "}
                        </p>
                        {/* Map other fields as needed */}
                        {roles == "ROLE_ADMIN" && (
                          <Button onClick={() => deleteTask(selectedTask.key)}>
                            Delete Task
                          </Button>
                        )}
                      </>
                    ) : (
                      <p>Select a task to see its details.</p>
                    )}
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Provider>
  );
};

export default App;
