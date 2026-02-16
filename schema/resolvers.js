import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

const resolvers = {
  Query: {
    // LOGIN
    login: async (_, { username, email, password }) => {
      const user = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error("Invalid password");
      }

      return user;
    },

    // GET ALL EMPLOYEES
    employees: async () => {
      return await Employee.find();
    },

    // SEARCH EMPLOYEE BY ID
    employeeById: async (_, { id }) => {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error("Employee not found");
      }
      return employee;
    },

    // SEARCH BY DESIGNATION
    employeesByDesignation: async (_, { designation }) => {
      return await Employee.find({ designation });
    },

    // SEARCH BY DEPARTMENT
    employeesByDepartment: async (_, { department }) => {
      return await Employee.find({ department });
    }
  },

  Mutation: {
    // SIGNUP
    signup: async (_, { username, email, password }) => {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        throw new Error("Username or Email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });

      return await newUser.save();
    },

    // ADD EMPLOYEE
    addEmployee: async (_, args) => {
      if (args.salary < 1000) {
        throw new Error("Salary must be >= 1000");
      }

      const existingEmployee = await Employee.findOne({
        email: args.email
      });

      if (existingEmployee) {
        throw new Error("Employee email already exists");
      }

      const employee = new Employee({
        ...args,
        created_at: new Date(),
        updated_at: new Date()
      });

      return await employee.save();
    },

    // UPDATE EMPLOYEE
    updateEmployee: async (_, { id, ...updates }) => {
      if (updates.salary && updates.salary < 1000) {
        throw new Error("Salary must be >= 1000");
      }

      updates.updated_at = new Date();

      const updatedEmployee = await Employee.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );

      if (!updatedEmployee) {
        throw new Error("Employee not found");
      }

      return updatedEmployee;
    },

    // DELETE EMPLOYEE
    deleteEmployee: async (_, { id }) => {
      const deletedEmployee = await Employee.findByIdAndDelete(id);

      if (!deletedEmployee) {
        throw new Error("Employee not found");
      }

      return deletedEmployee;
    }
  }
};

export default resolvers;
