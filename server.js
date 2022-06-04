import http from 'http';
import {readFileSync, writeFileSync} from 'fs';
import dotenv from 'dotenv';
import { findLastId } from './utility/functions.js';

//environment config
dotenv.config();
const PORT=process.env.SERVER_PORT;


//Data management
const students_json=readFileSync('./data/students.json');
const student_obj=JSON.parse(students_json);
// console.log(student_obj);
// console.log(student_obj[student_obj.length-1].id);



//create server
http.createServer((req,res)=>{
        
        
        if(req.url=='/api/students' && req.method=='GET'){
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(students_json);
        }
        else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method=='GET'){
            // console.log(req.url);
            let id=req.url.split('/')[3];
            //console.log(id);
            if(student_obj.some(stu=>stu.id==id)){
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify(student_obj.find(stu=>stu.id==id)));
            }
            else{
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify({
                    message:"Student Data Not Found!",
                }));
            }
        }
        else if(req.url=='/api/students' && req.method=='POST'){
           
            let data='';
            req.on('data',(chunk)=>{
                data +=chunk.toString();
            });
            req.on('end',()=>{
                let {name,skills,age,location} =JSON.parse(data);
               student_obj.push({
                    id:findLastId(student_obj),
                    name: name,
                    skills:skills,
                    age:age,
                    location:location

                });
                console.log(JSON.stringify(student_obj));
                writeFileSync('./data/students.json',JSON.stringify(student_obj));
            });
            

            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({
                message:"Post Data Okay!",
            }));
        }
        else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method=='DELETE'){
            let id=req.url.split('/')[3];
            let deleted_data=student_obj.filter(stu=>stu.id != id);
            // console.log(deleted_data);
            writeFileSync('./data/students.json',JSON.stringify(deleted_data));
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({
                message:"Data  Deleted Okay!",
            }));
        }
        else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method=='PUT' || req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method=='PATCH'){
            let id=req.url.split('/')[3];
            
            if(student_obj.some(stu=>stu.id==id)){
                let data='';
                req.on('data',(chunk)=>{
                    data +=chunk.toString();
                });
               req.on('end',()=>{
                   let {name,skills,age,location}=JSON.parse(data);
                    student_obj[student_obj.findIndex(stu=>stu.id == id)]={
                    id:id,
                    name: name,
                    skills:skills,
                    age:age,
                    location:location
                   };
                   writeFileSync('./data/students.json',JSON.stringify(student_obj));
               });
               
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify({
                    message:"Data  Edited Okay!",
                }));
            }
            else{
                res.writeHead(200,{'Content-Type':'application/json'});
                res.end(JSON.stringify({
                    message:"Student Data Isn't available for Update!",
                }));
            }
            
            
        }
        else{
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({
                error:"Invalid Data !",
            }));
        }
        
 
    
}).listen(PORT,()=>{
    console.log(`our Server run on ${PORT} port`)
});