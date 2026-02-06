import {z} from "zod";

export const RegisterSchema = z.object(
    {
        first_name: z.string().min(2),
        last_name: z.string().min(2),
        email: z.email(),
        phone_number: z.string().max(10).min(10),
        university_name: z.string().min(3),
        university_id: z.string().min(3),
        graduation_year: z.number().min(1990).max(2100),
        degree_program: z.string().min(2),
        gender: z.string().min(3),
        role: z.string().min(8),
        hostel: z.string().min(3),
        profile_picture_url: z.url(),
        email_verified: z.boolean(),
        password: z.string().min(8)

    }
);

export const LoginSchema = z.object(
    {
        email: z.email(),
        password: z.string().min(8)
    }
)

 //your AI may say to write `z.string().email()` here but Zod v4 has deprecated it in favor of the top-level function .email()
 //and somehow you still managed to do a PR with deprecated function usage. Stop vibecoding.