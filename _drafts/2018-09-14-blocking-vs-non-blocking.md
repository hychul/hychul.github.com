---
title: 블록킹 vs 논블록킹
date: 2018-09-14
categories:
- Development
tags:
- Development
- Java
---

 

```java
import java.net.*;
import java.io.*;

public class EchoServer {
    public static void main(String[] args){
        try{
            // 1. 10001번 포트에서 동작하는 ServerSocket을 생성
            ServerSocket server = new ServerSocket(10001);
            System.out.println("Wating Connect ..");
            
            // 2. ServerSocket의 accept() 메소드를 실행해서 클라이언트의 접속을 대기
            // : 클라이언트가 접속할 경우 accept() 메소드는 Socket 객체를 반환
            Socket socket = server.accept();
            InetAddress  inetaddr = sock.getInetAddress();
            System.out.println(String.format("%s 로부터 접속했습니다.", inetaddr.getHostAddress());

            // 3. 반환받은 Socket으로부터 InputStream과 OutputStream을 구함
            OutputStream out = sock.getOutputStream();
            InputStream in = sock.getInputStream();

            // 4. InputStream은 BufferedReader 형식으로 변환
            //    OutputStream은 PrintWriter 형식으로 변환
            PrintWriter pw = new PrintWriter(new OutputStreamWriter(out));
            BufferedReader br = new BufferedReader(new InputStreamReader(in));
            String line = null;

            //5. BufferedReader의 readLine() 메소드를 이용해
            //   클라이언트가 보내는 문자열 한 줄을 읽어들임
            while((line = br.readLine()) != null){
                System.out.println("클라이언트로부터 전송받은 문자열 : "+line);

                // 6. PrintWriter의 println을 이용해 다시 클라이언트로 전송
                pw.println(line);
                pw.flush();
            }

            // 6. IO 객체와 소켓의 close() 메소드 호출
            pw.close();
            br.close();
            sock.close();
        } catch(Exception e){
            System.out.println(e);
        }
    }
}
```

