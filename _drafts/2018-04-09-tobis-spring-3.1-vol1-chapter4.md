---
title: 토비의 스프링 3.1 vol.1 4장 - 예외
date: 2018-04-09
categories:
- Spring
tags:
- Development
- Spring
- Book
---

 4장에선...

## 예외 블랙홀

 IDE에선 처리되지 않은 예외가 있을 경우 친절하게 빨간 줄을 그러 '처리되지 않은 예외가 있다'고 에러 표시를 해준다. 이를 가장 간단하게 처리하는 방법은 try/catch 블록으로 둘러싸는 것이다. 이렇게 예외가 발생할 때 그것을 catch 블록을 써서 잡아내는 것까진 좋은데, 그 다음 아무것도 하지 않고 별문제 없는 것처럼 넘어가 버리는 건 정말 위험한 일이다. 무시한 예외로 인해 결국 어떤 기능이 비정상적으로 동작하는 등의 예상치 못한 다른 문제를 일으키게된다.

 모든 예외는 적절하게 복구되든지 아니면 작업을 중단시키고 운영자 또는 개발자에게 분명하게 통보되어야 한다. 굳이 예외를 잡아서 뭔가 조치를 취할 방법이 없다면 잡지말아야 한다. 메소드에 throws 를 선언해 처리하지 못한 예외를 메소드를 호출한 코드에게 책임을 전가하는게 낫다.

## 무의미하고 무책임한 throws

 catch 블록으로 예외를 잡아봐야 해결할 방법도 없고 JDK API나 라이브러리가 던지는 각종 이름도 긴 예외들을 처리하는 코드를 매번 throws로 선언하기도 귀찮아지기 시작하면 아래와 같이 메소드에 throws Exception을 기계적으로 붙이는 개발자도 있다.

 ```java
public void method() throw Exception {
    ...
}
 ```

 API 등에서 발생하는 예외를 일일이 catch하기도 귀찮고, 매번 정확하게 예외의 이름을 적어서 선언하기도 귀찮으니, 모든 예외를 무조건 던져버리는 선언을 넣는 것이다. 이런 무책임한 throws 선언의 문제점은 적절한 처리를 통해 복구될 수 있는 예외상황도 제대로 다룰 수 있는 기회를 박탈당한다는 것이다. 예외를 try/catch 블록으로 무시해버리는 것보단 낫지만, 매우 안좋은 예외처리 방법이다.

## 예외의 종류와 특징

 자바에서 throw를 통해 발생시킬 수 있는 예외는 크게 세가지가 있다.

### Error

 java.lang.Error 클래스의 서브클래스들이다. 주로 자바 VM에서 발생시키는 것이기 때문에 어플리케이션 코드에서 잡으려고 하면 안된다. OutOfMemoryError나 ThreadDeath같은 에러는 catch 블록으로 잡아봤자 아무런 대응 방법이 없기 때문이다.

### Exception과 체크 예외<sup>Checked Exception</sup>

 java.lang.Exception 클래스의 서브 클래스면서 RuntimeException 클래스를 상속하지 않는 클래스들이다. 일반적으로 말하는 예외라고 생각하면 된다. 명시적인 예외처리가 필요하기 때문에 체크 예외라고 하며, 체크 예외가 발생발생할 수 있는 메소드를 사용할 경우 반드시 예외를 처리하는 코드를 함께 작성해야 한다. 그렇지 않으면 컴파일 에러가 발생한다.

### RuntimeException과 언체크 예외<sup>Unchecked Exception</sup>

 Java.lang.RuntimeException 클래스를 상속한 클래스들이다. 이 예외 클래스들은 명시적인 예외처리를 강제하지 않기 때문에 언체크 예외라고 불리며 클래스 이름을 따서 런타임 에러라고도 한다. 런타임 에러를 catch 문으로 잡거나 throws로 선언하지 않아도 된다. 주로 프로그램 오류가 있을 때 발생하도록 의도된, NullPointerException 같은 것들이다. 이런 예외는 미리 조건을 체크하도록 주의 깊게 만든다면 피할 수 있다.

 그런데 자바 언어를 설계하고 JDK를 개발한 이런 설계 의도는 현실과 잘 맞지 않았고, 체크 예외의 불필요성을 주장하는 사람들이 늘어갔다. 최근의 자바 표준 스펙 API들은 예상 가능한 예외상황을 다루는 체크 예외를 만들지 않는 경향이 있다.

## 예외처리 방법

 예외를 처리하는 일반적인 세가지 방법을 설명한다.

### 예외 복구

 예외상황을 파악하고 문제를 해결해서 정상 상태로 돌려놓는 처리 방법이다. 기본 작업이 예외로 인해 수행이 불가능 할 경우 사용자에게 다른 작업으로 자연스럽게 유도해주거나, 정해진 횟수만큼 반복적으로 시도함으로써 예외상황에서 복구되게 하는 방법이다.

```java
public void method() {
    ...
    int remainRetry = MAX_RETRY;
    while (0 < reminaRetry) {
        try {
            ...
            return;
        } catch (SomeException e) {
            // 로그 출력, 정해진 시간만큼 대기
        } finally {
            // 리소스 반납, 정리 작업
        }
    }
    throw new RetryFailedException(); // 최대시도 횟수를 넘어가는 경우 직접 예외 발생
}
```

### 예외처리 회피

 예외처리를 직접하지 않고 자신을 호출한 쪽으로 던지는 것이다. 드물지만 템플릿/콜백 패턴에서 콜백 오브젝트의 메소드에서 템플릿에서 건네준 파라메터에서 예외가 발생하는 경우엔 예외를 처리하는 것은 콜백의 역할이 아니라고 볼 수 있다. 때문에 템플릿 레벨에서 처리될 수 있도록 특별한 목적을 갖기 때문에 발생한 예외를 그냥 던져버리는 무책임한 throws 와는 차이가 있다.

```java
public void method0() throws SomeException {
    // Some API
}

public void method1() throws SomeException {
    try {
        // Some API
    } catch (SomeException e) {
        // 로그 출력
        throw e;
    }
}
```

### 예외 전환

  예외를 복구해서 정상적인 상태로 만들 수 없기 때문에 예외를 메소드 밖으로 던지는 것이다. 하지만 예외처리 회피와 달리 발생한 예외를 그대로 던지는 것이 아니라 호출한 코드에서 처리될 수 있도록 적절한 예외로 변환을 해서 던진다.

예외 전환은 크게 두 가지 목적으로 사용된다.

 첫번째는 내부에서 발생한 예외를 그대로 던지는 것이 적절한 의미를 부여하지 못하는 경우, 의미를 분명히 해줄 수 있는 예외로 바꿔주기 위해서다.

```java
public void add(User user) throws DuplicateUserIdException, SQLException {
    try {
        ...
    } catch (SQLException e) {
        if (e.getErrorCode() == MysqlErrorNumbers.ER_DUP_ENTRY) {
            throw new DuplicateUserIdException(e); // 기존 예외를 알려주기 위해 중첩 예외를 사용
        } else {
            throw e;
        }
    }
}
```

 두번째는 발생한 체크 예외를 런타임 예외 등으로 포장을 해서 처리하기 쉽고 단순하게 하기 위해서다. 보통 비즈니스 로직이 볼 때 의미있는 예외이거나 복구 가능한 예외가 아닐 때 런타임 에러로 포장을 해서 던지는 편이 낫다.

 체크 예외를 계속 throws를 사용해 넘기는 건 무의미하다. 어차피 복구가 불가능한 예외라면 가능한 빨리 런타임 예외로 포장해 다른 계층의 메소드들을 작성할 때 throws 선언이 들어가지 않게 해줘야한다.

## 예외처리 전략

 자바의 예외를 사용하는 것은 간단하지만, 예외를 효과적으로 사용하고 예외가 발생하는 코드를 깔끔하게 정리하는 데는 여러 가지 신경쓸 것들이 많다.

### 런타임 예외의 보편화

 예외처리를 강제하는 것은 개발자의 실수를 방지하기 위한 배려라고도 볼 수 있지만, 예외를 제대로 다루고 싶지 않을 만큼 짜증나게 만드는 원인이기도 하다. 자바가 처음 만들어질 때 많이 사용한 독립형 어플리케이션에선 참조한 파일이 존재하지 않는 등의 통제 불가능한 시스템 예외라고 할지라도 어플리케이션이 중단되지 않게 해주고 상황을 복구해야했다.

 하지만 자바 엔터프라이즈 서버환경은 다르다. 서버의 특정 계층에서 예외가 발생했을 때 작업을 일시 중지 시키고 사용자와 커뮤니케이션하면서 예외상황을 복구할 수 있는 방법이 없다. 그저 예외가 발생한 해당 작업만 중단시키면 그만이다. 차라리 어플리케이션에서 예외상황을 미리 파악하고, 예외가 발생하지 않도록 차단하는 게 좋다. 또는 예외가 발생한 해당 요청 작업을 빨리 취소하고 서버 관리자나 개발자에게 통보하는 편이 좋다. 때문에 대응이 불가능한 예외라면 런타임 예외로 전환해서 던지는 것이 보편화 되고 있다.

### 적절한 예외로의 전환

 

### 어플리케이션 예외