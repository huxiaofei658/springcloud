package com.example.demo.Service;

import com.example.demo.Pojo.Student;

import java.util.List;

public interface TestmogoService {
    /**
     * 新增
     *
     * @param student
     */
    void save(Student student);

    /**
     * 删除
     *
     * @param name
     */
    void remove(String name);

    /**
     * 根据id查询
     *
     * @param id
     */
    Student findstuByid(Integer id);

    /**
     * 修改
     *
     * @param student
     */
    void updatestu(Student student);

    /**
     * 分页查询
     *
     * @param page
     * @param pageSize
     * @return list
     */
    List<Student> findall(Integer page, Integer pageSize);
}
