"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Upload,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

const { TextArea } = Input;
const { Option } = Select;

const AddTaskModal = ({ isVisible, onClose, onTaskAdded }) => {
  const [loading, setLoading] = useState(false);
  const [tas, setTAs] = useState([]);
  const [classes, setClasses] = useState([]); // State for classes (course groups)
  const { data: session } = useSession();
  const [file, setFile] = useState(null);

  // Fetch TAs and Classes when the modal is visible
  useEffect(() => {
    if (isVisible) {
      async function fetchTAs() {
        try {
          const response = await fetch("/api/tas");
          const data = await response.json();
          setTAs(data);
        } catch (error) {
          console.error("Error fetching TAs:", error);
        }
      }

      async function fetchClasses() {
        try {
          const response = await fetch("/api/classes"); // Replace with your API endpoint
          const data = await response.json();
          setClasses(data);
        } catch (error) {
          console.error("Error fetching classes:", error);
        }
      }

      fetchTAs();
      fetchClasses();
    }
  }, [isVisible]);

  // Handle file selection
  const handleFileChange = ({ fileList }) => {
    setFile(fileList[0]);
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("courseGroupType", values.courseGroupType); // Selected course group
      formData.append("dueDate", values.dueDate.format("YYYY-MM-DD"));
      formData.append("details", values.details);
      formData.append("professorId", session.user.id);
      formData.append("taId", values.taId);

      if (file) {
        formData.append("file", file.originFileObj);
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        message.success("Task created successfully");
        onClose();
        onTaskAdded();
      } else {
        message.error("Failed to create task");
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      title="Add New Task"
      onCancel={onClose}
      footer={null}
      width={800} // Increase modal width if needed
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Task Name"
          name="name"
          rules={[{ required: true, message: "Please input the task name!" }]}
          style={{ width: "100%" }}
        >
          <Input placeholder="Enter task name" />
        </Form.Item>

        <Form.Item
          label="Course Group"
          name="courseGroupType"
          rules={[{ required: true, message: "Please select a course group!" }]}
          style={{ width: "100%" }}
        >
          <Select placeholder="Select a course group" loading={classes.length === 0}>
            {classes.map((cls) => (
              <Option key={cls.id} value={cls.courseCode}>
                {`${cls.courseCode} `}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Assign To (TA)"
          name="taId"
          rules={[{ required: true, message: "Please select a TA!" }]}
          style={{ width: "100%" }}
        >
          <Select placeholder="Select a TA">
            {tas.map((ta) => (
              <Option key={ta.id} value={ta.id}>
                {ta.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Due Date"
          name="dueDate"
          rules={[{ required: true, message: "Please select a due date!" }]}
          style={{ width: "100%" }}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Details"
          name="details"
          rules={[{ required: true, message: "Please input task details!" }]}
          style={{ width: "100%" }}
        >
          <TextArea rows={4} placeholder="Enter task details" />
        </Form.Item>

        <Form.Item label="Attach File (Optional)" style={{ width: "100%" }}>
          <Upload beforeUpload={() => false} onChange={handleFileChange}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ width: "100%" }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTaskModal;
