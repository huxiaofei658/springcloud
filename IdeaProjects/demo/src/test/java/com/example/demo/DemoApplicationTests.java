package com.example.demo;

import com.example.demo.Pojo.Student;
import com.example.demo.Service.TestmogoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

//@RunWith(SpringRunner.class)
@SpringBootTest
class DemoApplicationTests {

    @Autowired
    TestmogoService testmogoService;
    @Test
    void contextLoads() {
    }

    @Test
    public  void findall(){
        List<Student> all = testmogoService.findall(3,3);
        for (Student s :all){
            System.out.println(s.get_id()+"-----"+s.getAge()+"-----"+s.getName());
        }
    }
}
