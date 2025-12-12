"use server";
import {SubjectSchemaInput} from "./formValidationSchemas";
import {revalidatePath} from "next/cache"

type currentState = {success:boolean; error:boolean};

export const createSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const updateSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.update({
            where: {
                id: data.id
            },
            
            data: {
                name: data.name
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const deleteSubject = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.subject.delete({
            where: {
                id: parseInt(id)
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
}