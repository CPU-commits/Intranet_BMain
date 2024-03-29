import { Subject } from 'rxjs'
import { Course } from 'src/modules/courses/entities/course.entity'
import { Cycle } from 'src/modules/courses/entities/cycle.entity'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { Voting } from 'src/modules/students/entities/voting.entity'
import { Specialty } from 'src/modules/subjects/entities/specialty.entity'
import { User } from 'src/modules/users/entities/user.entity'

export const Collections = {
    USER: User.name,
    CYCLE: Cycle.name,
    COURSE: Course.name,
    SUBJECT: Subject.name,
    SPECIALTY: Specialty.name,
    SEMESTER: Semester.name,
    VOTING: Voting.name,
}
