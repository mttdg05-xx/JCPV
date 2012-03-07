/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

function foo()
{
    return;
}

function foo1(x)
{
    return x;
}

function foo2(x,y)
{
    return x+y;
}

function foo3(x,y,z)
{
    return x+y+z;
}

function foo4(a,b,c,d)
{
    return a+b+c+d;
}

function foo5(a,b,c,d,e)
{
    return a+b+c+d+e;
}

function foo6(x)
{
    this.push(x);
    return this.length;
}

function foo7(i,x)
{
    this[i] = x;
}

function foo_proxy()
{
    if(foo.apply(undefined, []) !== undefined)
    {
        return 1;
    }

    if(foo1.apply(undefined, [1]) !== 1)
    {
        return 2;
    }

    if(foo2.apply(undefined, [1,2]) !== 3)
    {
        return 3;
    }

    if(foo3.apply(undefined, [1,2,3]) !== 6)
    {
        return 4;
    }

    if(foo4.apply(undefined, [1,2,3,4]) !== 10)
    {
        return 5;
    }

    if(foo5.apply(undefined, [1,2,3,4,5]) !== 15)
    {
        return 6;
    }

    if(foo6.apply([], [1]) !== 1)
    {
        return 7;
    }

    var a = [];
    foo7.apply(a, [42,1337]);
    if (a[42] !== 1337)
    {
        return 8;
    }

    return 0;
}
