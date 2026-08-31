"use server";

import { Resend } from "resend";

import SchoolCredentialsEmail from "@/emails/SchoolCredentialsEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendCredentialsParams = {
    email: string;
    schoolName: string;
    username: string;
    password: string;
};

export async function sendSchoolCredentials({
    email,
    schoolName,
    username,
    password,
}: SendCredentialsParams) {

    const { error } =
        await resend.emails.send({

            from: process.env.MAIL_FROM!,

            to: email,

            subject: "Bienvenue sur Wagadu School",

            react: SchoolCredentialsEmail({

                schoolName,

                username,

                password,

                appName: process.env.APP_NAME!,

            }),

        });

    if (error) {

        throw new Error(error.message);

    }

}