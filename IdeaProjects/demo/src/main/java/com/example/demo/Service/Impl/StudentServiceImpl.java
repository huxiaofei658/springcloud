package com.example.demo.Service.Impl;

import com.example.demo.MongoConf.MongodbConfig;
import com.example.demo.Pojo.Student;
import com.example.demo.Service.TestmogoService;
import com.mongodb.ReadConcern;
import com.mongodb.ReadPreference;
import com.mongodb.TransactionOptions;
import com.mongodb.WriteConcern;
import com.mongodb.client.*;
import org.bson.Document;
import org.omg.CORBA.OBJECT_NOT_EXIST;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.ScriptOperations;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.List;

@Service
public class StudentServiceImpl implements TestmogoService {

    @Autowired
    private MongoTemplate mongoTemplate;
    @Autowired
    private MongodbConfig mongodbConfig;


    private static String uri;

    @Value("${mongodb.uri}")
    public  void setUri(String uri) {
        this.uri = uri;
    }

    @Override
    public void save(Student student) {
        mongoTemplate.save(student);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void remove(String name) {

            Query query = new Query(Criteria.where("name").is(name));
            mongoTemplate.remove(query, Student.class);
            int i =1/0;
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

    }

     public Object getall(int x,int y){
       ScriptOperations scrript = mongoTemplate.scriptOps();
        return  scrript.call("getAll",1,2);
     }


    @Override
    public Student findstuByid(Integer id) {

        Query query = new Query(Criteria.where("_id").is(id));
        Student student = this.mongoTemplate.findOne(query, Student.class);
        return student;
    }

    @Override
    public void updatestu(Student student) {
        Query query = new Query(Criteria.where("_id").is(student.get_id()));
        Update update = new Update();
        update.set("name", student.getName());
    ////更新查询返回结果集的第一条updateFirst      updateMulti 更新查询返回结果集的所有
        this.mongoTemplate.updateFirst(query, update, Student.class
        );
    }

    @Override
    @Transactional
    public List<Student> findall(Integer page, Integer pageSize) {
        if (page < 0) {
            page = 0;
        }
        LookupOperation lp = LookupOperation.newLookup()
                .from("grade")//关联表名
                .localField("gradeId")//关联字段
                .foreignField("_id")//主表关联字段对应的次表字段
                .as("grade"); //查询结果集合名
        // 将条件封装到Aggregate管道
        Aggregation aggregation = Aggregation.newAggregation(
                lp,
                Aggregation.project("_id", "name", "sex", "age", "gradeId", "grade.gradeName"),//指定输出文档中的字段
                Aggregation.sort(Sort.Direction.ASC, "_id"),//排序
                Aggregation.skip((page - 1) * pageSize),//过滤条数，跳过一定数量的数据
                Aggregation.limit(pageSize));//限制传递给下一步的文档数量
        //查询
        List<Student> students = mongoTemplate.aggregate(aggregation, "student", Student.class).getMappedResults();
        //test 存储过程
       /* try {
            int i = 1 / 0;
        } catch (Exception e) {
            e.printStackTrace();
        }*/
        return students;
    }



    /////test////

    public static void main(String[] args) {
         //String uri="";
        //通过uri创建一个mongo客户端
       // System.out.println(mongodbConfig.getUri());

        final MongoClient client = MongoClients.create("mongodb://127.0.0.1:27018,127.0.0.1:2701 9,127.0.0.1:27020/test1?replicaSet=rs0");
        //通过连接获取数据库名称和表名称
       // client.getDatabase("test1").getCollection("test1");
        // .withWriteConcern(WriteConcern.MAJORITY).insertOne( new Document("abc", 0));
        //client.getDatabase("mydb2").getCollection("bar");
        //.withWriteConcern(WriteConcern.MAJORITY).insertOne( new Document("xyz", 0));

        /* Step 1: Start a client session. */
        /*开启事务处理*/
        final ClientSession clientSession = client.startSession();
        /* Step 2: Optional. Define options to use for the transaction. */


        /**
         * 事务选项配置
         */
        TransactionOptions txnOptions = TransactionOptions.builder()
                .readPreference(ReadPreference.primary())
                .readConcern(ReadConcern.LOCAL)//readConcern 决定这个节点上的数据哪些是可读的 "LOCAL"主节点插入数据从节点立刻读取不到数据,MAJORITY可以避免脏读
                .writeConcern(WriteConcern.MAJORITY)
                .build();

        /*****************/

        MongoCollection<Document> coll1 = client.getDatabase("test1").getCollection("test1");
        MongoCollection<Document> coll2 = client.getDatabase("test2").getCollection("test2");

        TransactionBody txnBody = new TransactionBody<String>() {
            public String execute() {
                /*   test  mongo1  */
               // MongoCollection<Document> coll1 = client.getDatabase("test1").getCollection("test1");
                //获取数据库mongo集合、表
                // MongoCollection<Document> coll2 = client.getDatabase("mydb2").getCollection("bar");

                    /*
                     *必须将会话传递给操作。
                     */
                coll1.insertOne(clientSession, new Document("测试112", 112));
                coll2.insertOne(clientSession, new Document("xyz", 999));
                int i = 1/0;
                return "Inserted into collections in different databases";
            }
        };

        try {
    /*
        Step 4: Use .withTransaction() to start a transaction,
        execute the callback, and commit (or abort on error).
        使用.withTransaction（）启动事务，执行回调
     */
            clientSession.withTransaction(txnBody, txnOptions);//事务核心代码
        } catch (RuntimeException e) {
            // some error handling
            System.out.println(e.getMessage());
        } finally {
            clientSession.close();
        }




//***MongoDB事务操作///
        //MongoDB 多文档事务的使用方式
        ClientSession clientSession1 = client.startSession();
        try{
            clientSession1.startTransaction(txnOptions);
            coll1.insertOne(clientSession, new Document("测试112", 112));
            coll2.insertOne(clientSession, new Document("test112", "12"));
        }catch(Exception exception){
            clientSession1.abortTransaction();//事务回滚
            exception.printStackTrace();
        }
        clientSession1.commitTransaction();
    }


}