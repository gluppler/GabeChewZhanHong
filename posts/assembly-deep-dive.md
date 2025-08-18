# A Journey into Assembly Language for ARM64 & x86-64

Understanding how software interacts with hardware at the lowest levels is a critical skill in security research. It's the bedrock of reverse engineering, vulnerability analysis, and exploit development. This project documents my personal journey into learning Assembly for two of the most prevalent architectures today: ARM64 (AArch64) and x86-64.

## Why Learn Assembly?

In an age of high-level languages and powerful frameworks, diving into Assembly might seem archaic. However, for a security researcher, it's indispensable. Assembly provides a direct view of a program's execution flow, memory management, and interaction with the operating system kernel. Without it, you're essentially reading a translated version of the story; with it, you're reading the original manuscript.

This repository serves as a collection of my notes, code examples, and foundational exercises as I explore these powerful, low-level concepts.

## Part 1: Exploring ARM64 (AArch64)

The ARM architecture dominates the mobile and embedded device landscape, making it a crucial area of study. My exploration covers the fundamentals of the AArch64 instruction set.

### Core Concepts Covered:

- **Registers & Data Movement**: Understanding the roles of general-purpose registers (X0-X30), the zero register (XZR), and using instructions like MOV to manipulate data.
- **Arithmetic Operations**: Implementing basic math with ADD, SUB, MUL, and SDIV.
- **Control Flow**: Using comparison (CMP) and branching instructions (B.cond, B) to create loops and conditional logic.
- **System Calls (syscalls)**: Interacting with the Linux kernel to perform actions like writing to the console or exiting a program.

### Example: "Hello, World!" in ARM64 Assembly

```assembly
// Hello.s
.data
message: .asciz "Hello, Assembly!\\n"
len = . - message

.text
.globl _start

_start:
    // write(stdout, message, len)
    mov x0, #1      // stdout file descriptor
    ldr x1, =message // message address
    ldr x2, =len    // message length
    mov x8, #64     // write syscall number
    svc #0          // make the system call

    // exit(0)
    mov x0, #0      // exit code
    mov x8, #93     // exit syscall number
    svc #0          // make the system call
```

## Part 2: Demystifying x86-64 Linux

The x86-64 architecture is the backbone of modern desktops, laptops, and servers. This section focuses on writing Assembly for 64-bit Linux systems using the NASM assembler.

### Core Concepts Covered:

- **Data Sections**: Defining variables and constants in the .data and .bss sections.
- **System Calls (x86-64)**: Understanding the x86-64 calling convention (using registers like RAX, RDI, RSI, RDX).
- **Stack Operations**: Managing the stack with PUSH and POP for function calls and local variable storage.
- **Branching & Loops**: Implementing if-then-else structures, for loops, and while loops using cmp, jmp, and conditional jump instructions.

### Example: Basic Arithmetic in x86-64 Assembly

```assembly
; Arithmetic.asm
section .text
global _start

_start:
    mov rax, 20     ; Move the value 20 into the RAX register
    mov rbx, 20     ; Move the value 20 into the RBX register
    add rax, rbx    ; Add RBX to RAX (RAX = RAX + RBX)

    ; exit(0)
    mov rax, 60     ; exit syscall number
    mov rdi, 0      ; exit code
    syscall         ; make the system call
```

## Conclusion

This project is an ongoing effort to build a solid foundation in low-level systems. Understanding these fundamentals is crucial for anyone serious about security research and system-level programming.

The journey into Assembly language has been incredibly rewarding, providing insights into how modern computers execute instructions at the most fundamental level. These skills directly translate to better vulnerability research, more effective reverse engineering, and a deeper understanding of system security.

## Resources & References

- [ARM64 Developer Guide](https://developer.arm.com/documentation/102374/latest/)
- [Intel x86-64 Software Developer Manual](https://software.intel.com/content/www/us/en/develop/articles/intel-sdm.html)
- [Linux System Call Reference](https://syscalls.kernelgrok.com/)
- [NASM Documentation](https://www.nasm.us/docs.php)