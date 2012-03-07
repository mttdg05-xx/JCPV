;; _________________________________________________________________________
;;
;;             Tachyon : A Self-Hosted JavaScript Virtual Machine
;;
;;
;;  This file is part of the Tachyon JavaScript project. Tachyon is
;;  distributed at:
;;  http://github.com/Tachyon-Team/Tachyon
;;
;;
;;  Copyright (c) 2011, Universite de Montreal
;;  All rights reserved.
;;
;;  This software is licensed under the following license (Modified BSD
;;  License):
;;
;;  Redistribution and use in source and binary forms, with or without
;;  modification, are permitted provided that the following conditions are
;;  met:
;;    * Redistributions of source code must retain the above copyright
;;      notice, this list of conditions and the following disclaimer.
;;    * Redistributions in binary form must reproduce the above copyright
;;      notice, this list of conditions and the following disclaimer in the
;;      documentation and/or other materials provided with the distribution.
;;    * Neither the name of the Universite de Montreal nor the names of its
;;      contributors may be used to endorse or promote products derived
;;      from this software without specific prior written permission.
;;
;;  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
;;  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
;;  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
;;  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
;;  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
;;  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
;;  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
;;  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
;;  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
;;  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
;;  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
;; _________________________________________________________________________

;;;============================================================================

;;; File: "js2scm-rt#.scm", Time-stamp: <2011-03-01 19:48:23 feeley>

;;; Copyright (c) 2010 by Marc Feeley, All Rights Reserved.

;;;============================================================================

(declare
 (standard-bindings)
 (extended-bindings)
 (not safe)
 (block)
 (not inline)
)

(define-macro (js.undefined)
  `(##void))
;  `(##type-cast -7 2)) ;; #!unbound object

;;; JavaScript forms.

(define-macro (js.var variable)
  `(define ,variable (js.undefined)))

(define-macro (js.function params body)
  `(lambda (this
            #!optional
            ,@(map (lambda (p) (list p '(js.undefined))) params)
            .
            args)
     ,body))

(define-macro (js.function-with-arguments params body)
  `(lambda (this . args)
     (let* ((_arguments (list->Array args))
            ,@(map (lambda (p)
                     (list p `(if (pair? args)
                                  (let ((arg (car args)))
                                    (set! args (cdr args))
                                    arg)
                                  (js.undefined))))
                   params))
       ,body)))

(define-macro (js.function-with-nontail-return params body)
  `(lambda (this
            #!optional
            ,@(map (lambda (p) (list p '(js.undefined))) params)
            .
            args)
     (continuation-capture
      (lambda (return)
        ,body))))

(define-macro (js.function-with-nontail-return-with-arguments params body)
  `(lambda (this . args)
     (let* ((_arguments (list->Array args))
            ,@(map (lambda (p)
                     (list p `(if (pair? args)
                                  (let ((arg (car args)))
                                    (set! args (cdr args))
                                    arg)
                                  (js.undefined))))
                   params))
       (continuation-capture
        (lambda (return)
          ,body)))))

(define-macro (js.return value)
  `(continuation-return return ,value))

(define-macro (js.this)
  `this)

(define-macro (js.guard-odd-false x expr)
  `(if (or (js.=== ,x (js.undefined))
           (js.=== ,x '())
           (js.=== ,x 0)
           (js.=== ,x ""))
       #f ;;; (error "odd false detected" ,x ,expr)
       ,x))

(define-macro (js.if test consequent alternative)
  `(if (let ((x ,test))
         (js.guard-odd-false x '(js.if ,test ,consequent ,alternative)))
       ,consequent
       ,alternative))

(define-macro (js.call fn . args)
  (if (and (pair? fn)
           (eq? (car fn) 'js.index))
      `(let* ((self ,(cadr fn)) (f (js.index self ,(caddr fn))))
         ((if (procedure? f) f ',fn) self ,@args))
      `(,fn '() ,@args)))

(define-macro (js.new ctor . args)
  `(let* ((ctor ,ctor)
          (self (make-obj ctor))
          (retval (ctor self ,@args)))
     (if (##eq? retval (js.undefined))
         self
         retval)))

(define-macro (js.index obj prop)
  `(js:index ,obj ,prop))

(define-macro (js.index-set! obj prop value)
  `(js:index-set! ,obj ,prop ,value))

(define-macro (js.array-lit . elems)
  `(js:array-lit ,@elems))

(define-macro (js.obj-lit . props)
  `(js:obj-lit ,@props))

(define-macro (js.prop name value)
  `(cons ,name ,value))

(define-macro (js.goto ctrl-point)

  (define (ctrl-point->id ctrl-point)
    (string->symbol (string-append "point" (number->string ctrl-point))))

  `(continuation-return ,(ctrl-point->id ctrl-point) (void)))

(define-macro (js.continue ctrl-point)
  `(js.goto ,ctrl-point))

(define-macro (js.break ctrl-point)
  `(js.goto ,ctrl-point))

(define-macro (js.ctrl-point ctrl-point expr)

  (define (ctrl-point->id ctrl-point)
    (string->symbol (string-append "point" (number->string ctrl-point))))

  (if (= ctrl-point 0)
      expr
      `(continuation-capture
        (lambda (,(ctrl-point->id ctrl-point))
          ,expr))))

(define-macro (js.dowhile break-ctrl-point continue-ctrl-point loop-id body test)
  `(js.ctrl-point
    ,break-ctrl-point
    (let ,loop-id ()
         (js.ctrl-point
          ,continue-ctrl-point
          ,body)
         (if (let ((x ,test))
               (js.guard-odd-false x '(js.dowhile ,break-ctrl-point ,continue-ctrl-point ,loop-id ,body ,test)))
             (,loop-id)))))

(define-macro (js.while break-ctrl-point continue-ctrl-point loop-id test body)
  `(js.ctrl-point
    ,break-ctrl-point
    (let ,loop-id ()
         (if (let ((x ,test))
               (js.guard-odd-false x '(js.while ,break-ctrl-point ,continue-ctrl-point ,loop-id ,test ,body)))
             (begin
               (js.ctrl-point
                ,continue-ctrl-point
                ,body)
               (,loop-id))))))

(define-macro (js.for break-ctrl-point continue-ctrl-point loop-id test body step)
  `(js.ctrl-point
    ,break-ctrl-point
    (let ,loop-id ()
         (if (let ((x ,test))
               (js.guard-odd-false x '(js.for ,break-ctrl-point ,continue-ctrl-point ,loop-id ,test ,body ,step)))
             (begin
               (js.ctrl-point
                ,continue-ctrl-point
                ,body)
               ,step
               (,loop-id))))))

(define-macro (js.forin break-ctrl-point continue-ctrl-point loop-id lhs set body)
  `(js.ctrl-point
    ,break-ctrl-point
    (js:forin
     ,set
     (lambda (key)
       (js.= ,lhs key)
       (js.ctrl-point
        ,continue-ctrl-point
        ,body)))))

(define-macro (js.switch break-ctrl-point val . clauses)
  `(js.ctrl-point
    ,break-ctrl-point
    (let ((switch-val ,val))
      (js.switch-clauses ,@clauses))))

(define-macro (js.switch-clauses . clauses)
  (if (assq 'js.case-fall-through clauses)

      (let* ((default-case
               #f)
             (fns-curr (map (lambda (clause)
                              (if (equal? (cadr clause) '(js.default))
                                  (set! default-case clause))
                              (cons clause (gensym)))
                            clauses))
             (fns-next (map cons
                            clauses
                            (append (map cdr (cdr fns-curr))
                                    (list #f)))))

        (define (gen clauses default-fn)
          (if (pair? clauses)
              (let* ((clause (car clauses))
                     (curr-fn (cdr (assq clause fns-curr)))
                     (case-expr (cadr clause)))
                (if (equal? case-expr '(js.default))
                    (gen (cdr clauses) curr-fn)
                    `(if (js.=== switch-val ,case-expr)
                         (,curr-fn)
                         ,(gen (cdr clauses) default-fn))))
              (if default-fn
                  `(,default-fn)
                  `(js.undefined))))

        `(letrec ,(map (lambda (clause)
                         (let ((curr-fn (cdr (assq clause fns-curr)))
                               (next-fn (cdr (assq clause fns-next))))
                           `(,curr-fn
                             (lambda ()
                               ,(if (and (eq? 'js.case-fall-through
                                              (car clause))
                                         #;next-fn)
                                    `(begin
                                       ,(caddr clause)
                                       (,next-fn))
                                    `,(caddr clause))))))
                       clauses)
           ,(gen clauses #f)))

      (let ()

        (define (gen clauses default-clause)
          (if (pair? clauses)
              (let* ((clause (car clauses))
                     (case-expr (cadr clause)))
                (if (equal? case-expr '(js.default))
                    (gen (cdr clauses) clause)
                    `(if (js.=== switch-val ,case-expr)
                         ,(caddr clause)
                         ,(gen (cdr clauses) default-clause))))
              (if default-clause
                  (caddr default-clause)
                  `(js.undefined))))

        (gen clauses #f))))

(define-macro (js.throw val)
  `(js:throw ,val))

(define-macro (js.try body . final-body)
  body) ;; TODO support exception handling

(define-macro (js.try-catch body id catch-body . final-body)
  body) ;; TODO support exception handling

(define-macro (js.debugger)
  `(break))

;;; JavaScript operators.

(define-macro (js.delete x)
  `(TODO-js.delete))

(define-macro (js.void x)
  `(TODO-js.void))

(define-macro (js.typeof x)
  `(js:typeof ,x))

(define-macro (js.++x x)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((self ,(cadr x)) (key ,(caddr x)) (res (js.+ (js.index self key) 1)))
         (js.index-set! self key res)
         res)
      `(let ((res (js.+ ,x 1)))
         (set! ,x res)
         res)))

(define-macro (js.auto++x x)
  `(TODO-js.auto++x))

(define-macro (js.--x x)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((self ,(cadr x)) (key ,(caddr x)) (res (js.- (js.index self key) 1)))
         (js.index-set! self key res)
         res)
      `(let ((res (js.- ,x 1)))
         (set! ,x res)
         res)))

(define-macro (js.auto--x x)
  `(TODO-js.auto--x))

(define-macro (js.~ x)
  `(fxnot ,x))

(define-macro (js.! x)
  `(not (let ((x ,x))
          (js.guard-odd-false x '(js.! ,x)))))

(define-macro (js.x++ x)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((self ,(cadr x)) (key ,(caddr x)) (res (js.index self key)))
         (js.index-set! self key (js.+ res 1))
         res)
      `(let ((res ,x))
         (set! ,x (js.+ res 1))
         res)))

(define-macro (js.x-- x)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((self ,(cadr x)) (key ,(caddr x)) (res (js.index self key)))
         (js.index-set! self key (js.- res 1))
         res)
      `(let ((res ,x))
         (set! ,x (js.- res 1))
         res)))

(define-macro (js.* x y)
  (if #t ;; assume only numerical type is fixnum and no overflow
      `(let* ((x ,x) (y ,y))
         (if (##fixnum? x)
             (if (##fixnum? y)
                 (if (fx= y 0)
                     0
                     (let ((r (##fx*? x y)))
                       (or r (js:* x y))))
                 (js:* x y))
             (js:* x y)))
      `(##fx* ,x ,y)))

(define-macro (js./ x y)
  `(/ ,x ,y));;;;;;;;;;;;;;;;;;;;;;;;;

(define-macro (js.% x y)
  `(fxmodulo ,x ,y))

(define-macro (js.+ x . y)
  (if (null? y)
      `(js.+ 0 ,x)
      (if #t
          `(let* ((x ,x) (y ,(car y)))
             (if (##fixnum? x)
                 (if (##fixnum? y)
                     (let ((r (##fx+? x y)))
                       (or r (js:+ x y)))
                     (js:+ x y))
                 (js:+ x y)))
          `(##fx+ ,x ,(car y)))))

(define-macro (js.- x . y)
  (if (null? y)
      `(js.- 0 ,x)
      (if #t ;; assume only numerical type is fixnum and no overflow
          `(let* ((x ,x) (y ,(car y)))
             (if (##fixnum? x)
                 (if (##fixnum? y)
                     (let ((r (##fx-? x y)))
                       (or r (js:- x y)))
                     (js:- x y))
                 (js:- x y)))
          `(##fx- ,x ,(car y)))))

(define-macro (js.<< x y)
  `(fxarithmetic-shift-left ,x ,y))

(define-macro (js.>> x y)
  `(fxarithmetic-shift-right ,x ,y))

(define-macro (js.>>> x y)
  `(fxarithmetic-shift-right ,x ,y));;;;;;;;;;;;;;;;;

(define-macro (js.< x y)
  (if #t ;; assume only numerical type is fixnum and no overflow
      `(let* ((x ,x) (y ,y))
         (if (##fixnum? x)
             (if (##fixnum? y)
                 (##fx< x y)
                 (js:< x y))
             (js:< x y)))
      `(##fx< ,x ,y)))

(define-macro (js.> x y)
  (if #t ;; assume only numerical type is fixnum and no overflow
      `(let* ((x ,x) (y ,y))
         (if (##fixnum? x)
             (if (##fixnum? y)
                 (##fx> x y)
                 (js:> x y))
             (js:> x y)))
      `(##fx> ,x ,y)))

(define-macro (js.<= x y)
  (if #t ;; assume only numerical type is fixnum and no overflow
      `(let* ((x ,x) (y ,y))
         (if (##fixnum? x)
             (if (##fixnum? y)
                 (##fx<= x y)
                 (js:<= x y))
             (js:<= x y)))
      `(##fx<= ,x ,y)))

(define-macro (js.>= x y)
  (if #t ;; assume only numerical type is fixnum and no overflow
      `(let* ((x ,x) (y ,y))
         (if (##fixnum? x)
             (if (##fixnum? y)
                 (##fx>= x y)
                 (js:>= x y))
             (js:>= x y)))
      `(##fx>= ,x ,y)))

(define-macro (js.instanceof x y)
  `(js:instanceof ,x ,y))

(define-macro (js.in x y)
  `(TODO-js.in))

(define-macro (js.== x y)
  `(js:== ,x ,y))

(define-macro (js.!= x y)
  `(js:!= ,x ,y))

(define-macro (js.=== x y)
  `(js:=== ,x ,y))

(define-macro (js.!== x y)
  `(js:!== ,x ,y))

(define-macro (js.& x y)
  `(fxand ,x ,y))

(define-macro (js.^ x y)
  `(fxxor ,x ,y))

(define-macro (|js.\|| x y)
  `(fxior ,x ,y))

(define-macro (js.&& x y)
  `(and (let ((x ,x))
          (js.guard-odd-false x '(js.&& ,x ,y)))
        ,y))

(define-macro (|js.\|\|| x y)
  `(or (let ((x ,x))
          (js.guard-odd-false x '(|js.\|\|| ,x ,y)))
       ,y))

(define-macro (|js.,| x y)
  `(begin ,x ,y))

(define-macro (js.= x y)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((self ,(cadr x)) (key ,(caddr x)) (res ,y))
         (js.index-set! self key res)
         res)
      `(let ((res ,y))
         (set! ,x res)
         res)))

(define-macro (js.op= op x y)
  (if (and (pair? x)
           (eq? (car x) 'js.index))
      `(let* ((y ,y) (self ,(cadr x)) (key ,(caddr x)) (res (,op (js.index self key) y)))
         (js.index-set! self key res)
         res)
      `(let* ((y ,y) (res (,op ,x y)))
         (set! ,x res)
         res)))

(define-macro (js.+= x y) `(js.op= js.+ ,x ,y))
(define-macro (js.-= x y) `(js.op= js.- ,x ,y))
(define-macro (js.*= x y) `(js.op= js.* ,x ,y))
(define-macro (js./= x y) `(js.op= js./ ,x ,y))
(define-macro (js.<<= x y) `(js.op= js.<< ,x ,y))
(define-macro (js.>>= x y) `(js.op= js.>> ,x ,y))
(define-macro (js.>>>= x y) `(js.op= js.>>> ,x ,y))
(define-macro (js.&= x y) `(js.op= js.& ,x ,y))
(define-macro (js.^= x y) `(js.op= js.^ ,x ,y))
(define-macro (|js.\|=| x y) `(js.op= |js.\|| ,x ,y))
(define-macro (js.%= x y) `(js.op= js.% ,x ,y))

(define-macro (js.x?y:z x y z)
  `(if (let ((x ,x))
         (js.guard-odd-false x '(js.x?y:z ,x ,y ,z)))
       ,y
       ,z))

;;;============================================================================
