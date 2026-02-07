import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import type { StudentWithUser } from "@shared/schema";
import { 
  Search, 
  User, 
  Mail, 
  Phone,
  GraduationCap,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const { data: students, isLoading } = useStudents();

  const filteredStudents = students?.filter(student => {
    const matchesSearch = search === "" || 
      student.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.usn.toLowerCase().includes(search.toLowerCase()) ||
      student.user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
      student.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">View and manage your assigned students.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, USN, or email..." 
            className="pl-9 border-border/60" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Information Science">Information Science</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : filteredStudents?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
          <User className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No students found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents?.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: StudentWithUser }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={student.profilePhotoUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {student.user.firstName[0]}{student.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <CardTitle className="text-lg truncate">
              {student.user.firstName} {student.user.lastName}
            </CardTitle>
            <CardDescription className="text-xs font-mono">
              {student.usn}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{student.department}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Year {student.year}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Sem {student.semester}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {student.batch}
            </Badge>
          </div>
        </div>
        
        <div className="pt-2 border-t space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{student.user.email}</span>
          </div>
          {student.user.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{student.user.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
