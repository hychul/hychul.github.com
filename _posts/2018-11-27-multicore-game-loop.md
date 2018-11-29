---
title: 게임 엔진 이해 - 멀티 코어 게임 루프
date: 2018-11-27
categories:
- Game
tags:
- Development
- Game
- GameEngine
---

 단일코어를 넘어 듀얼코어, 쿼드코어 CPU가 생산되고, 현재는 그보다 더 많은 수의 코어를 지원하는 CPU도 개발되었다. 멀티 코어의 시대가 찾아온 것이다. 이런 시대의 흐름에 따라 다수의 유저들은 멀티코어 CPU를 택하기 시작했다. 게임이 효율적으로 동작하기 위해선 싱글 스레드로 하나의 코어만 사용하는 것이 아니라 멀티 스레딩을 통해 존재하는 모든 코어를 효율적으로 사용해야한다.

 멀티 스레딩을 적용할 때 가장 주의해야 하는 것은 한 자원에 동시에 접근하는 것이다. 스레드를 나눠서 동작을 하면 각 스레드는 순서를 보장하지 않는다. 한 자원을 수정할 땐 자원의 값을 읽고, 수정하고, 값을 쓰는 동작이 필요하다. 

 자원을 하나씩 증가시키는 로직이 두번 반복될 때, 단일 스레드에서 동작한다면 읽기, 수정, 쓰기, 읽기, 수정, 쓰기가 순차적으로 반복된다. 하지만 멀티 스레드에선 자원이 쓰여진 뒤에 읽어진다는 보장이 없기 때문에 로직이 각 스레드에서 두번 동작한다고 하더라도 결과가 달라질 수 있다.

![img](https://lh6.googleusercontent.com/PUWRCXFAojwepqo-hSAXE8jOaVPfq-CWEDyNWye8U8KnEzFGZZqLHziOeNFE5LVsNp6WRUIYz6UxOzHwh75HZM99ntq46iHxIsvw4hBeso5-uoqRWwiiO_4FoKtUreygDAMyGjzt)

의도대로라면 모든 동작이 끝난후 2가 되어야 하지만 1이 된다

 동시에 한 자원에 접근을 할 때는 수정하는 스레드가 하나 이상이면 안된다. 즉 한 스레드가 수정을 하고 나머지는 읽기만 한다면 멀티 스레딩을 적용 하더라도 문제가 되지 않는다.

# 게임 로직과 렌더링을 나누기

 게임 로직에선 게임 오브젝트들의 상태를 수정하지만 렌더링에선 읽기만 수행한다. 때문에 렌더링이 다른 스레드에서 동작 하더라도 게임 오브젝트에 아무런 영향을 끼치지 않는다. 다만 주의할 점은 게임 로직과 렌더링을 다른 스레드에서 동작하도록 하면 상태의 업데이트와 화면의 업데이트의 시간이 일치하지 않을 수 있다는 것이다.

 예를 들어 두 캐릭터가 같은 애니메이션을 같은 순간에 시작했다고 해보자. 게임 로직은 게임 오브젝트 리스트를 돌면서 애니메이션을 업데이트 할 것이고 한 캐릭터의 애니메이션만 업데이트 했을 때 렌더링이 된다면 동시에 변해야할 애니메이션이 한 캐릭터가 먼저 변한 것처럼 보일 것이다.

![img](https://lh5.googleusercontent.com/5MRWFKHZe5yE82sW2AaHhVi5EMoY386pFoU0SDIoA1PT8z0GJbBRHgvCMa_zsu0eFkZMQ9gdFAdcAyeI01gPdBZr3hBg3biSKv_b7VxG_mf9fjgzv2KjGAr0zHtjHHd1XSMbglMo)

<center>한 게임 프레임에서 업데이트한 정보의 부분만 화면에 출력된다.</center><br />

 게임이 다른 어플리케이션과 다르게 게임 루프를 통해 화면이 계속 갱신되기 때문에 위의 예에서 한 캐릭터가 먼저 변했다고는 하지만, 그것은 한 프레임의 차이일 것이고 60FPS 기준으로 16ms, 즉 0.016초의 아주 적은 차이다. 하지만 프레임에 민감한 액션 게임들에게는 이는 엄청난 차이이다. 때문에 로직과 렌더링을 다른 스레드로 나눴다고 하더라도 동기화를 통해 한 게임 프레임에서 게임 로직이 업데이트한 정보를 가지고 렌더링을 해야한다.

![img](https://lh4.googleusercontent.com/t_kWGy8YKbZb1eCW0Fgn7f6jb2LjIJp_-2ck4yOwGYQffnwVw16PRx82U2w2jfsBcs0i4jD9BOCJHGsuFLlJzzsc3Xuf5E8-lsaMawmfR8VL8zvK0Hml_g2QSliGC2T22EOhhBj3)

<center>게임 프레임에서 업데이트 된 정보가 모두 출력된다.</center><br />

 이렇게 되면 게임 로직은 렌더링이 되는 동안 연산을 하고 렌더링은 모니터 주사율과 일치되면서도 연산이 되는 동안 화면에 출력하는 효율적인 멀티 스레딩을 가능하게 할 수 있다. 또한 이제 게임 프레임은 입력과 게임 로직으로 구성 된다.

# 게임 로직을 나누기

 렌더링을 다른 스레드에서 동작하도록 했지만 여전히 게임 로직을 연산하는 시간이 너무 길어진다면 프레임이 드랍된다.  때문에 게임 로직을 효율적으로 동작하도록 하여 연산이 되는 시간을 줄여야한다.

 게임 로직은 여러 게임 오브젝트들이 상호작용하기 때문에 게임 로직을 구성하는 모든 작업들을 일일이 서로 연관이 없는 동작들을 다른 스레드로 할당하는 것은 거의 불가능하다. 하지만 게임 프레임에서 렌더링을 분리한 것처럼, 게임 로직 내에서 서로 영향을 끼치지 않는 작업들 정리한다면 각각의 독립적인 작업을 멀티 스레딩을 사용할 수 있다. 대표적으로 물리, 애니메이션, 컬링 등이 있다.

 충돌처리로 예를 들자면 각 게임 오브젝트의 로직과 관계 없이 동작하고 각 게임 오브젝트들은 충돌처리를 통해 다른 게임 오브젝트와 충돌했는지에 대한 정보를 갖고 게임 오브젝트의 로직을 수행한다. 즉 충돌처리가 끝난 후 게임 오브젝트의 로직이 수행되어야 한다.

 충돌처리를 멀티 스레딩을 사용하여 처리하게 하여 한 코어에서 처리하는 연산에 대한 부하를 다른 코어와 나눠 충돌 처리에 걸리는 시간을 줄일 수 있다. 비록 모든 스레드가 동시에 끝나지 않을 수 있지만 한 코어에서 처리하던 일을 나눠가졌기 때문에 단일 스레드에서 동작하는 것 보다는 확실히 충돌처리에 걸리는 시간이 줄어든다.

![img](https://lh6.googleusercontent.com/JWVa0fdEfbl-YOGZzNZYaf-vRO_iL4LNcwGLqEotyXHfgPmQzizORw_tb1Y36leLu-3Laz8cTM9d0tawLk5Grz5Vg_JdVitfh3Oh7hCBGVOFKVmjT2RlDqFYRNF6uhdpXM2ecbv9)

<center>스레드를 여러개로 나눌 수록 처리 속도가 줄어든다.</center><br />

 이런 방식을 통해 게임 로직에 걸리는 시간을 멀티 스레딩을 통해 줄일 수 있게 된다. 또한 게임 오브젝트 로직과 같이 게임마다 달라지는 로직을 제외한 나머지 작업을 나눠 미리 작성해 둔 뒤 게임에 따라 게임 오브젝트 로직만 작성하여 게임을 보다 효율적으로 개발할 수 있게 된다. 이렇게 미리 작성된 게임 루프를 **게임 엔진**이라고 한다.