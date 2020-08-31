package com.example.demo.Controller;

import com.example.demo.Pojo.Student;
import com.example.demo.Service.Impl.StudentServiceImpl;
import com.example.demo.Service.TestmogoService;
import com.example.demo.Util.Result;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/test")
@Api(tags = "测试控制器")
public class student {
    @Autowired
    TestmogoService studentService;
    @Autowired
    StudentServiceImpl studentServiceImpl;

    ////测试Swagger注解
   /* @ApiOperation(value="分页查询",notes = "方法内参数的备注说明-----")
    @ApiResponses({
            @ApiResponse(code=400,message="请求参数没填好"),
            @ApiResponse(code=404,message="请求路径没有或页面跳转路径不对")
    })*/
    @RequestMapping("/getStu")
    public List<Student> findall() {
        System.out.println("hello----------------");
        List<Student> all = studentService.findall(4, 1);
        //故意制造错误看结果
        // int i = 1/0;
        ///test foreach
        /* for (Student s :all){
            System.out.println(s.get_id()+"-----"+s.getAge()+"-----"+s.getName());
        }*/
        return all;

    }

    @RequestMapping("/remove")
    public String removeStu() {
        studentService.remove("12");
        return "success";

    }

    //test  存储过程
    @RequestMapping("/getall")
    public Object getall() {
        return studentServiceImpl.getall(1, 2);
    }
}
