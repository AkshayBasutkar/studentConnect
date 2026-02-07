import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus } from "lucide-react";
import { useCreateUser, useCreateStudent, useCreateProctor } from "@/hooks/use-users";
import { useUsers } from "@/hooks/use-users";
import type { InsertUser, InsertStudent, InsertProctor } from "@shared/schema";

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "proctor", "admin"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

const studentFormSchema = z.object({
  userId: z.number(),
  usn: z.string().min(1, "USN is required"),
  department: z.string().min(1, "Department is required"),
  year: z.number().min(1).max(4),
  semester: z.number().min(1).max(8),
  batch: z.string().min(1, "Batch is required"),
  proctorId: z.number().optional(),
  profilePhotoUrl: z.string().optional(),
});

const proctorFormSchema = z.object({
  userId: z.number(),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
});

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  
  const createUser = useCreateUser();
  const createStudent = useCreateStudent();
  const createProctor = useCreateProctor();
  const { data: users } = useUsers();

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      userId: 0,
      usn: "",
      department: "",
      year: 1,
      semester: 1,
      batch: "",
      proctorId: undefined,
      profilePhotoUrl: undefined,
    },
  });

  const proctorForm = useForm<z.infer<typeof proctorFormSchema>>({
    resolver: zodResolver(proctorFormSchema),
    defaultValues: {
      userId: 0,
      employeeId: "",
      department: "",
      designation: "",
    },
  });

  const handleUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    createUser.mutate(values as InsertUser, {
      onSuccess: (user) => {
        setCreatedUserId(user.id);
        if (values.role === "student") {
          studentForm.setValue("userId", user.id);
          setActiveTab("student");
        } else if (values.role === "proctor") {
          proctorForm.setValue("userId", user.id);
          setActiveTab("proctor");
        } else {
          // Admin doesn't need additional profile
          handleClose();
        }
      },
    });
  };

  const handleStudentSubmit = async (values: z.infer<typeof studentFormSchema>) => {
    createStudent.mutate(values as InsertStudent, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleProctorSubmit = async (values: z.infer<typeof proctorFormSchema>) => {
    createProctor.mutate(values as InsertProctor, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    userForm.reset();
    studentForm.reset();
    proctorForm.reset();
    setCreatedUserId(null);
    setActiveTab("user");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-md shadow-primary/20">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and their profile information.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="user" disabled={createdUserId !== null}>
              User Account
            </TabsTrigger>
            <TabsTrigger value="student" disabled={createdUserId === null || userForm.watch("role") !== "student"}>
              Student Profile
            </TabsTrigger>
            <TabsTrigger value="proctor" disabled={createdUserId === null || userForm.watch("role") !== "proctor"}>
              Proctor Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4 mt-4">
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={userForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="proctor">Proctor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@college.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUser.isPending}>
                    {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="student" className="space-y-4 mt-4">
            <Form {...studentForm}>
              <form onSubmit={studentForm.handleSubmit(handleStudentSubmit)} className="space-y-4">
                <FormField
                  control={studentForm.control}
                  name="usn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>USN (University Seat Number) *</FormLabel>
                      <FormControl>
                        <Input placeholder="1CR18CS001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={studentForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={studentForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="4" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studentForm.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="8" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={studentForm.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch *</FormLabel>
                      <FormControl>
                        <Input placeholder="2018-2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStudent.isPending}>
                    {createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Student Profile
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="proctor" className="space-y-4 mt-4">
            <Form {...proctorForm}>
              <form onSubmit={proctorForm.handleSubmit(handleProctorSubmit)} className="space-y-4">
                <FormField
                  control={proctorForm.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="EMP001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={proctorForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={proctorForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation *</FormLabel>
                      <FormControl>
                        <Input placeholder="Assistant Professor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createProctor.isPending}>
                    {createProctor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Proctor Profile
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
