# codegen

Script to generate code. This script was created from JS Expert course by Erick Wendel.

# Get Started

### Instalation

1. Clone this repository
2. Install the packages

```sh
npm install
```

3. Link the project to create a shortcut on terminal

```sh
npm link
```

You can use the following command to unlink

```sh
npm unlink
```

### Usage

Use the --help command to know hot to use.

```sh
codegen --help
```

Here is an example how to use codegen

```sh
codegen skeleton -c product -c person -c colors
```

# Task Checklist

- [x] creates `src` main folder if it not exists
- [x] creates `repository` layer
- [x] creates `service` layer with `repository` as dependency
- [x] creates `factory` layer with `service` and `repository` returning its instances
- [x] can create multiples domains with a single comand
- [x] saves files as `camelCase` and classes as `PascalCase`
- [x] reaches **100% test coverage**
- [x] integration tests should validate files on disk as a valid JS class
