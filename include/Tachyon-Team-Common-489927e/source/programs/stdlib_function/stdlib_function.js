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

function test_ctor()
{
    if (typeof Function !== 'function')
        return 1;
    if (!(Function instanceof Function))
        return 2;
    if (typeof test_ctor !== 'function')
        return 3;
    if (!(test_ctor instanceof Function))
        return 4;

    return 0;
}

function test_toString()
{
    var s = test_toString.toString();

    if (typeof s !== 'string')
        return 1;

    if (s.length < 8)
        return 2;

    return 0;
}

function sum()
{
    var sum = 0;

    for (var i = 0; i < arguments.length; ++i)
        sum += arguments[i];

    return sum;
}

function test_apply()
{
    if (sum.apply(null, [1, 2, 3]) !== 6)
        return 1;

    if (sum.apply(null, [1, 2, 3, 4, 5, 6]) !== 21)
        return 2;

    return 0;
}

function test_call()
{
    if (sum.call(null, 1, 2, 3) !== 6)
        return 1;

    if (sum.call(null, 1, 2, 3, 4, 5, 6) !== 21)
        return 2;

    return 0;
}

function test()
{
    var r = test_ctor();
    if (r != 0)
        return 100 + r;

   var r = test_toString();
    if (r != 0)
        return 200 + r;

   var r = test_apply();
    if (r != 0)
        return 300 + r;

   var r = test_call();
    if (r != 0)
        return 400 + r;

    return 0;
}

