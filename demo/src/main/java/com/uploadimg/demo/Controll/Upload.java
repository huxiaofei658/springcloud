package com.uploadimg.demo.Controll;

import com.uploadimg.demo.entity.ResponseMessage;
import com.uploadimg.demo.entity.UploadFile;
import org.bson.types.Binary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Date;

@Controller
public class Upload {
    @Autowired
    MongoTemplate mongoTemplate;

    @RequestMapping("/file/uploadimg")
    @ResponseBody //@RequestParam(value = "image")
    public ResponseMessage uploadimg(MultipartFile file , HttpServletRequest req) {
        if (file.isEmpty()) {
            return ResponseMessage.file("文件为空，请选择需要上传的文件");
        }
        String filename = file.getOriginalFilename();
        try {
            UploadFile uf = new UploadFile();
            uf.setContent(new Binary(file.getBytes()));
            uf.setName(filename);
            uf.setContentType(file.getContentType());
            uf.setCreateTime(new Date());
            uf.setSize(file.getSize());
            //入库
            UploadFile uploadFile = mongoTemplate.save(uf);
            //返回url
            String url = "http://192.168.11.237:8080/file/image/" + uploadFile.getId();
            return ResponseMessage.success(url);

        } catch (IOException e) {
            e.printStackTrace();
        }
        return ResponseMessage.success();
    }

    //getImage
    @GetMapping(value = "/file/image/{id}",produces = {MediaType.IMAGE_JPEG_VALUE,MediaType.IMAGE_PNG_VALUE,MediaType.IMAGE_GIF_VALUE})
    @ResponseBody
    public byte[] getimage(@PathVariable String id) {
        byte[] data = null;
        UploadFile file = mongoTemplate.findById(id, UploadFile.class);
        if (file != null) {
            data = file.getContent().getData();
        }
        return data;
    }
//测试
    @RequestMapping("/login")
    public String login() {
        System.out.println("1");
        return "index.html";
    }
}
