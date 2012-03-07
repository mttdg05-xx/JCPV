var a = new x86.Assembler(x86.target.x86);
const reg = a.register;
const ESP = reg.esp;
const EAX = reg.eax;
const EBX = reg.ebx;
const ECX = reg.ecx;
const EDX = reg.edx;
const $   = a.immediateValue;
const mem = a.memory;
const _   = function (reg) { return mem(0,reg); };
const _12   = function (reg) { return mem(12,reg); };
const _16   = function (reg) { return mem(16,reg); };

a.codeBlock.bigEndian = false;

// In cdecl calling convention, registers ebx, esi, edi, and ebp
// are callee-save
               
a.
push($(0)).                                    // push(stack, 0)
gen8(0xD9).gen8(0xEB).                         genListing("fldpi: push(ST, PI)").
gen8(0xD9).gen8(0xEB).                         genListing("fldpi: push(ST, PI)").
gen8(0xD8).gen8(0xC9).                         genListing("fmul: ST(0) <- [ST(0)] * [ST(1)]").
gen8(0xDB).opndModRMSIB(3, mem(0,ESP)).        genListing("fistp(0): stack <- pop(ST(0))").
pop(EAX).                                      // EAX <- pop(stack)
ret();              

a.codeBlock.assemble();

print(a.codeBlock.listingString());

var block = a.codeBlock.assembleToMachineCodeBlock(); // assemble it

block.link();

var result = execMachineCodeBlock(block); // execute the code generated

print('result: ' + result);
