# 小小文明岛 Android App

这是按 `docs/小小文明岛-PRD.md` 实现的 Android P0 可玩切片。

## 已实现范围

- 首屏文明危机：洪水、水痕、饿居民、散粮、断田、倒仓。
- 文明火堆/营地工坊：完成能力后在火堆周围沉淀长期可见标签。
- 数学反应系统：同类合并、异类弹回、公平饭桌、阵列发芽、长形低效、记忆延续。
- P0 主流程：清点、分类、分饭、丈量、建仓、泥板记录、第二天完成态。
- 错误即实验：错分、错放、错量、错建会产生世界反馈，不弹答题判错。

## 构建

不依赖 Gradle 也能构建：

```bash
bash scripts/build-apk.sh
```

输出：

```text
build/manual/app-debug.apk
```

也可以用 Android Studio/Gradle 打开本目录，工程使用 Android Gradle Plugin 8.2.0。
