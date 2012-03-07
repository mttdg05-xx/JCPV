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

/**
@fileOverview

Unit tests for heap

@copyright
Copyright (c) 2010 Tachyon Javascript Engine, All Rights Reserved
*/

tests.utility = tests.utility || tests.testSuite();

tests.utility.heap = tests.testSuite();

tests.utility.heap.base = function ()
{
    var h = new Heap(function (a,b) { return a-b; });
    assert(h.parent(0) < 0);
    assert(h.parent(1) === 0);
    assert(h.parent(2) === 0);
    assert(h.parent(3) === 1);
    assert(h.parent(4) === 1);
    assert(h.parent(5) === 2);
    assert(h.parent(6) === 2);

    assert(h.left(0) === 1);
    assert(h.left(1) === 3);
    assert(h.left(2) === 5);

    assert(h.right(0) === 2);
    assert(h.right(1) === 4);
    assert(h.right(2) === 6);

    assert(h.isEmpty());

    h.clear();
    assert(h.isEmpty());
    assert(h.length === 0);
};

tests.utility.heap.maxheap = function ()
{
    var h = new Heap(function (a,b) {return a-b;});    
    var a = [5,4,3,2,1];

    h.fromArray(a);

    assert(h.root() === 5);
    assert(h.extract() === 5, h.toString());
    assert(h.extract() === 4, h.toString());
    assert(h.extract() === 3, h.toString());
    assert(h.extract() === 2, h.toString());
    assert(h.extract() === 1, h.toString());

    h.fromArray([1,2,3,4,5]);
    assert(h.root() === 5);
    assert(h.extract() === 5, h.toString());
    assert(h.extract() === 4, h.toString());
    assert(h.extract() === 3, h.toString());
    assert(h.extract() === 2, h.toString());
    assert(h.extract() === 1, h.toString());

    h.fromArray([1,2]);
    h.insert(10);
    h.insert(3);
    h.insert(5);
    assert(h.extract() === 10);
    assert(h.extract() === 5);
    assert(h.extract() === 3);
    assert(h.extract() === 2);
    assert(h.extract() === 1);

    h.fromArray([]);
    h.insert(1);
    h.insert(10);
    assert(h.extract() === 10);
    h.insert(5);
    assert(h.extract() === 5);
    h.insert(0);
    h.insert(11);
    assert(h.extract() === 11);
    assert(h.extract() === 1);
    assert(h.extract() === 0);
    assert(h.isEmpty());

};

tests.utility.heap.minheap = function ()
{
    var h = new Heap(function (a,b) {return b-a;});    
    var a = [5,4,3,2,1];

    h.fromArray(a);

    assert(h.root() === 1);
    assert(h.extract() === 1);
    assert(h.extract() === 2);
    assert(h.extract() === 3);
    assert(h.extract() === 4);
    assert(h.extract() === 5);

    h.fromArray([1,2,3,4,5]);
    assert(h.root() === 1);
    assert(h.extract() === 1);
    assert(h.extract() === 2);
    assert(h.extract() === 3);
    assert(h.extract() === 4);
    assert(h.extract() === 5);

    h.fromArray([1,2]);
    h.insert(10);
    h.insert(3);
    h.insert(5);
    assert(h.extract() === 1);
    assert(h.extract() === 2);
    assert(h.extract() === 3);
    assert(h.extract() === 5);
    assert(h.extract() === 10);

    h.fromArray([]);
    h.insert(1);
    h.insert(10);
    assert(h.extract() === 1);
    h.insert(5);
    assert(h.extract() === 5);
    h.insert(0);
    h.insert(11);
    assert(h.extract() === 0);
    assert(h.extract() === 10);
    assert(h.extract() === 11);
    assert(h.isEmpty());
};
