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
XML tree generation/manipulation code.

@author
Maxime Chevalier-Boisvert

@copyright
Copyright (c) 2010 Maxime Chevalier-Boisvert, All Rights Reserved
*/

/**
@class Base class for XML nodes
*/
function XMLNode()
{
}

/**
@class Represent an XML document
*/
function XMLDocument(rootElem, isHTML)
{
    /**
    Root XML element
    @field
    */
    this.root = rootElem;

    /**
    Flag to indicate that this is an HTML document
    @field
    */
    this.isHTML = isHTML;
}
XMLDocument.prototype = new XMLNode();

/**
Produce a string representation of an XML document
*/
XMLDocument.prototype.toString = function ()
{
    return this.root.toString(this, '');
};

/**
@class Represent an XML/HTML element
*/
function XMLElement(name, attribs, isLeaf)
{
    assert (
        !attribs || attribs instanceof Object,
        'the attributes must be provided in an object'
    );

    /**
    Element name
    @field
    */
    this.name = name;

    /**
    Dictionary of attributes for this element
    @field
    */
    this.attribs = attribs || {};

    /**
    List of children elements
    @field
    */
    this.children = [];

    /**
    Flag to indicate that this is a leaf
    @field
    */
    this.isLeaf = isLeaf;
}
XMLElement.prototype = new XMLNode();

/**
Produce a string representation of this node
*/
XMLElement.prototype.toString = function (document, indent)
{
    var escName = escapeXMLString(this.name);

    // Declare a string for the output
    var output = indent + '<' + escName;

    // For each attribute
    for (var attrName in this.attribs)
    {
        output += ' ' + escapeXMLString(attrName) + '="';
        output += escapeXMLString(this.attribs[attrName].toString()) + '"';
    }

    output += (this.isLeaf? ' />':'>\n');

    // For each child node
    for (var i = 0; i < this.children.length; ++i)
    {
        output += this.children[i].toString(document, indent + '  ') + '\n';
    }

    if (!this.isLeaf)
        output += indent + '</' + escName + '>';

    // Return the output string
    return output;
};

/**
Add a new child to an XML element
*/
XMLElement.prototype.addChild = function (childNode)
{
    assert (
        childNode instanceof XMLNode,
        'new child should be XML node'
    );

    this.children.push(childNode);
};

/**
@class XML text string node
*/
function XMLText(text)
{
    /**
    Text contents of this node
    @field
    */
    this.text = text;
}
XMLText.prototype = new XMLNode();

/**
Produce a string representation of this node
*/
XMLText.prototype.toString = function (document, indent)
{
    // Escape and indent the string
    return indentText(escapeXMLString(this.text), indent);
};

