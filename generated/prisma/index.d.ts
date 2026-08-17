
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Inventario
 * 
 */
export type Inventario = $Result.DefaultSelection<Prisma.$InventarioPayload>
/**
 * Model ItemInventario
 * 
 */
export type ItemInventario = $Result.DefaultSelection<Prisma.$ItemInventarioPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Inventarios
 * const inventarios = await prisma.inventario.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Inventarios
   * const inventarios = await prisma.inventario.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.inventario`: Exposes CRUD operations for the **Inventario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inventarios
    * const inventarios = await prisma.inventario.findMany()
    * ```
    */
  get inventario(): Prisma.InventarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.itemInventario`: Exposes CRUD operations for the **ItemInventario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItemInventarios
    * const itemInventarios = await prisma.itemInventario.findMany()
    * ```
    */
  get itemInventario(): Prisma.ItemInventarioDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Inventario: 'Inventario',
    ItemInventario: 'ItemInventario'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "inventario" | "itemInventario"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Inventario: {
        payload: Prisma.$InventarioPayload<ExtArgs>
        fields: Prisma.InventarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          findFirst: {
            args: Prisma.InventarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          findMany: {
            args: Prisma.InventarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>[]
          }
          create: {
            args: Prisma.InventarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          createMany: {
            args: Prisma.InventarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>[]
          }
          delete: {
            args: Prisma.InventarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          update: {
            args: Prisma.InventarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          deleteMany: {
            args: Prisma.InventarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InventarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>[]
          }
          upsert: {
            args: Prisma.InventarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventarioPayload>
          }
          aggregate: {
            args: Prisma.InventarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventario>
          }
          groupBy: {
            args: Prisma.InventarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventarioCountArgs<ExtArgs>
            result: $Utils.Optional<InventarioCountAggregateOutputType> | number
          }
        }
      }
      ItemInventario: {
        payload: Prisma.$ItemInventarioPayload<ExtArgs>
        fields: Prisma.ItemInventarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemInventarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemInventarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          findFirst: {
            args: Prisma.ItemInventarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemInventarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          findMany: {
            args: Prisma.ItemInventarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>[]
          }
          create: {
            args: Prisma.ItemInventarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          createMany: {
            args: Prisma.ItemInventarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItemInventarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>[]
          }
          delete: {
            args: Prisma.ItemInventarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          update: {
            args: Prisma.ItemInventarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          deleteMany: {
            args: Prisma.ItemInventarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemInventarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ItemInventarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>[]
          }
          upsert: {
            args: Prisma.ItemInventarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemInventarioPayload>
          }
          aggregate: {
            args: Prisma.ItemInventarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItemInventario>
          }
          groupBy: {
            args: Prisma.ItemInventarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemInventarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemInventarioCountArgs<ExtArgs>
            result: $Utils.Optional<ItemInventarioCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    inventario?: InventarioOmit
    itemInventario?: ItemInventarioOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type InventarioCountOutputType
   */

  export type InventarioCountOutputType = {
    itens: number
  }

  export type InventarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itens?: boolean | InventarioCountOutputTypeCountItensArgs
  }

  // Custom InputTypes
  /**
   * InventarioCountOutputType without action
   */
  export type InventarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventarioCountOutputType
     */
    select?: InventarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InventarioCountOutputType without action
   */
  export type InventarioCountOutputTypeCountItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemInventarioWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Inventario
   */

  export type AggregateInventario = {
    _count: InventarioCountAggregateOutputType | null
    _avg: InventarioAvgAggregateOutputType | null
    _sum: InventarioSumAggregateOutputType | null
    _min: InventarioMinAggregateOutputType | null
    _max: InventarioMaxAggregateOutputType | null
  }

  export type InventarioAvgAggregateOutputType = {
    unidade_id: number | null
  }

  export type InventarioSumAggregateOutputType = {
    unidade_id: number | null
  }

  export type InventarioMinAggregateOutputType = {
    id: string | null
    data: Date | null
    unidade_id: number | null
    status: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type InventarioMaxAggregateOutputType = {
    id: string | null
    data: Date | null
    unidade_id: number | null
    status: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type InventarioCountAggregateOutputType = {
    id: number
    data: number
    unidade_id: number
    status: number
    criadoEm: number
    atualizadoEm: number
    _all: number
  }


  export type InventarioAvgAggregateInputType = {
    unidade_id?: true
  }

  export type InventarioSumAggregateInputType = {
    unidade_id?: true
  }

  export type InventarioMinAggregateInputType = {
    id?: true
    data?: true
    unidade_id?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type InventarioMaxAggregateInputType = {
    id?: true
    data?: true
    unidade_id?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type InventarioCountAggregateInputType = {
    id?: true
    data?: true
    unidade_id?: true
    status?: true
    criadoEm?: true
    atualizadoEm?: true
    _all?: true
  }

  export type InventarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inventario to aggregate.
     */
    where?: InventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventarios to fetch.
     */
    orderBy?: InventarioOrderByWithRelationInput | InventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Inventarios
    **/
    _count?: true | InventarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventarioMaxAggregateInputType
  }

  export type GetInventarioAggregateType<T extends InventarioAggregateArgs> = {
        [P in keyof T & keyof AggregateInventario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventario[P]>
      : GetScalarType<T[P], AggregateInventario[P]>
  }




  export type InventarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventarioWhereInput
    orderBy?: InventarioOrderByWithAggregationInput | InventarioOrderByWithAggregationInput[]
    by: InventarioScalarFieldEnum[] | InventarioScalarFieldEnum
    having?: InventarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventarioCountAggregateInputType | true
    _avg?: InventarioAvgAggregateInputType
    _sum?: InventarioSumAggregateInputType
    _min?: InventarioMinAggregateInputType
    _max?: InventarioMaxAggregateInputType
  }

  export type InventarioGroupByOutputType = {
    id: string
    data: Date
    unidade_id: number
    status: string
    criadoEm: Date
    atualizadoEm: Date
    _count: InventarioCountAggregateOutputType | null
    _avg: InventarioAvgAggregateOutputType | null
    _sum: InventarioSumAggregateOutputType | null
    _min: InventarioMinAggregateOutputType | null
    _max: InventarioMaxAggregateOutputType | null
  }

  type GetInventarioGroupByPayload<T extends InventarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventarioGroupByOutputType[P]>
            : GetScalarType<T[P], InventarioGroupByOutputType[P]>
        }
      >
    >


  export type InventarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    unidade_id?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    itens?: boolean | Inventario$itensArgs<ExtArgs>
    _count?: boolean | InventarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventario"]>

  export type InventarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    unidade_id?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }, ExtArgs["result"]["inventario"]>

  export type InventarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    data?: boolean
    unidade_id?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }, ExtArgs["result"]["inventario"]>

  export type InventarioSelectScalar = {
    id?: boolean
    data?: boolean
    unidade_id?: boolean
    status?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }

  export type InventarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "data" | "unidade_id" | "status" | "criadoEm" | "atualizadoEm", ExtArgs["result"]["inventario"]>
  export type InventarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itens?: boolean | Inventario$itensArgs<ExtArgs>
    _count?: boolean | InventarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InventarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InventarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InventarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Inventario"
    objects: {
      itens: Prisma.$ItemInventarioPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      data: Date
      unidade_id: number
      /**
       * "ABERTO" | "CONCLUIDO"
       */
      status: string
      criadoEm: Date
      atualizadoEm: Date
    }, ExtArgs["result"]["inventario"]>
    composites: {}
  }

  type InventarioGetPayload<S extends boolean | null | undefined | InventarioDefaultArgs> = $Result.GetResult<Prisma.$InventarioPayload, S>

  type InventarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InventarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InventarioCountAggregateInputType | true
    }

  export interface InventarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Inventario'], meta: { name: 'Inventario' } }
    /**
     * Find zero or one Inventario that matches the filter.
     * @param {InventarioFindUniqueArgs} args - Arguments to find a Inventario
     * @example
     * // Get one Inventario
     * const inventario = await prisma.inventario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventarioFindUniqueArgs>(args: SelectSubset<T, InventarioFindUniqueArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inventario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InventarioFindUniqueOrThrowArgs} args - Arguments to find a Inventario
     * @example
     * // Get one Inventario
     * const inventario = await prisma.inventario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventarioFindUniqueOrThrowArgs>(args: SelectSubset<T, InventarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioFindFirstArgs} args - Arguments to find a Inventario
     * @example
     * // Get one Inventario
     * const inventario = await prisma.inventario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventarioFindFirstArgs>(args?: SelectSubset<T, InventarioFindFirstArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inventario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioFindFirstOrThrowArgs} args - Arguments to find a Inventario
     * @example
     * // Get one Inventario
     * const inventario = await prisma.inventario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventarioFindFirstOrThrowArgs>(args?: SelectSubset<T, InventarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inventarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inventarios
     * const inventarios = await prisma.inventario.findMany()
     * 
     * // Get first 10 Inventarios
     * const inventarios = await prisma.inventario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventarioWithIdOnly = await prisma.inventario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventarioFindManyArgs>(args?: SelectSubset<T, InventarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inventario.
     * @param {InventarioCreateArgs} args - Arguments to create a Inventario.
     * @example
     * // Create one Inventario
     * const Inventario = await prisma.inventario.create({
     *   data: {
     *     // ... data to create a Inventario
     *   }
     * })
     * 
     */
    create<T extends InventarioCreateArgs>(args: SelectSubset<T, InventarioCreateArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inventarios.
     * @param {InventarioCreateManyArgs} args - Arguments to create many Inventarios.
     * @example
     * // Create many Inventarios
     * const inventario = await prisma.inventario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventarioCreateManyArgs>(args?: SelectSubset<T, InventarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inventarios and returns the data saved in the database.
     * @param {InventarioCreateManyAndReturnArgs} args - Arguments to create many Inventarios.
     * @example
     * // Create many Inventarios
     * const inventario = await prisma.inventario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inventarios and only return the `id`
     * const inventarioWithIdOnly = await prisma.inventario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventarioCreateManyAndReturnArgs>(args?: SelectSubset<T, InventarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inventario.
     * @param {InventarioDeleteArgs} args - Arguments to delete one Inventario.
     * @example
     * // Delete one Inventario
     * const Inventario = await prisma.inventario.delete({
     *   where: {
     *     // ... filter to delete one Inventario
     *   }
     * })
     * 
     */
    delete<T extends InventarioDeleteArgs>(args: SelectSubset<T, InventarioDeleteArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inventario.
     * @param {InventarioUpdateArgs} args - Arguments to update one Inventario.
     * @example
     * // Update one Inventario
     * const inventario = await prisma.inventario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventarioUpdateArgs>(args: SelectSubset<T, InventarioUpdateArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inventarios.
     * @param {InventarioDeleteManyArgs} args - Arguments to filter Inventarios to delete.
     * @example
     * // Delete a few Inventarios
     * const { count } = await prisma.inventario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventarioDeleteManyArgs>(args?: SelectSubset<T, InventarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inventarios
     * const inventario = await prisma.inventario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventarioUpdateManyArgs>(args: SelectSubset<T, InventarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inventarios and returns the data updated in the database.
     * @param {InventarioUpdateManyAndReturnArgs} args - Arguments to update many Inventarios.
     * @example
     * // Update many Inventarios
     * const inventario = await prisma.inventario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inventarios and only return the `id`
     * const inventarioWithIdOnly = await prisma.inventario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InventarioUpdateManyAndReturnArgs>(args: SelectSubset<T, InventarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inventario.
     * @param {InventarioUpsertArgs} args - Arguments to update or create a Inventario.
     * @example
     * // Update or create a Inventario
     * const inventario = await prisma.inventario.upsert({
     *   create: {
     *     // ... data to create a Inventario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inventario we want to update
     *   }
     * })
     */
    upsert<T extends InventarioUpsertArgs>(args: SelectSubset<T, InventarioUpsertArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioCountArgs} args - Arguments to filter Inventarios to count.
     * @example
     * // Count the number of Inventarios
     * const count = await prisma.inventario.count({
     *   where: {
     *     // ... the filter for the Inventarios we want to count
     *   }
     * })
    **/
    count<T extends InventarioCountArgs>(
      args?: Subset<T, InventarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventarioAggregateArgs>(args: Subset<T, InventarioAggregateArgs>): Prisma.PrismaPromise<GetInventarioAggregateType<T>>

    /**
     * Group by Inventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventarioGroupByArgs['orderBy'] }
        : { orderBy?: InventarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Inventario model
   */
  readonly fields: InventarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Inventario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    itens<T extends Inventario$itensArgs<ExtArgs> = {}>(args?: Subset<T, Inventario$itensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Inventario model
   */
  interface InventarioFieldRefs {
    readonly id: FieldRef<"Inventario", 'String'>
    readonly data: FieldRef<"Inventario", 'DateTime'>
    readonly unidade_id: FieldRef<"Inventario", 'Int'>
    readonly status: FieldRef<"Inventario", 'String'>
    readonly criadoEm: FieldRef<"Inventario", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Inventario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Inventario findUnique
   */
  export type InventarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter, which Inventario to fetch.
     */
    where: InventarioWhereUniqueInput
  }

  /**
   * Inventario findUniqueOrThrow
   */
  export type InventarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter, which Inventario to fetch.
     */
    where: InventarioWhereUniqueInput
  }

  /**
   * Inventario findFirst
   */
  export type InventarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter, which Inventario to fetch.
     */
    where?: InventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventarios to fetch.
     */
    orderBy?: InventarioOrderByWithRelationInput | InventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inventarios.
     */
    cursor?: InventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inventarios.
     */
    distinct?: InventarioScalarFieldEnum | InventarioScalarFieldEnum[]
  }

  /**
   * Inventario findFirstOrThrow
   */
  export type InventarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter, which Inventario to fetch.
     */
    where?: InventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventarios to fetch.
     */
    orderBy?: InventarioOrderByWithRelationInput | InventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inventarios.
     */
    cursor?: InventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inventarios.
     */
    distinct?: InventarioScalarFieldEnum | InventarioScalarFieldEnum[]
  }

  /**
   * Inventario findMany
   */
  export type InventarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter, which Inventarios to fetch.
     */
    where?: InventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inventarios to fetch.
     */
    orderBy?: InventarioOrderByWithRelationInput | InventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Inventarios.
     */
    cursor?: InventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inventarios.
     */
    skip?: number
    distinct?: InventarioScalarFieldEnum | InventarioScalarFieldEnum[]
  }

  /**
   * Inventario create
   */
  export type InventarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Inventario.
     */
    data: XOR<InventarioCreateInput, InventarioUncheckedCreateInput>
  }

  /**
   * Inventario createMany
   */
  export type InventarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Inventarios.
     */
    data: InventarioCreateManyInput | InventarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inventario createManyAndReturn
   */
  export type InventarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * The data used to create many Inventarios.
     */
    data: InventarioCreateManyInput | InventarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inventario update
   */
  export type InventarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Inventario.
     */
    data: XOR<InventarioUpdateInput, InventarioUncheckedUpdateInput>
    /**
     * Choose, which Inventario to update.
     */
    where: InventarioWhereUniqueInput
  }

  /**
   * Inventario updateMany
   */
  export type InventarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Inventarios.
     */
    data: XOR<InventarioUpdateManyMutationInput, InventarioUncheckedUpdateManyInput>
    /**
     * Filter which Inventarios to update
     */
    where?: InventarioWhereInput
    /**
     * Limit how many Inventarios to update.
     */
    limit?: number
  }

  /**
   * Inventario updateManyAndReturn
   */
  export type InventarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * The data used to update Inventarios.
     */
    data: XOR<InventarioUpdateManyMutationInput, InventarioUncheckedUpdateManyInput>
    /**
     * Filter which Inventarios to update
     */
    where?: InventarioWhereInput
    /**
     * Limit how many Inventarios to update.
     */
    limit?: number
  }

  /**
   * Inventario upsert
   */
  export type InventarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Inventario to update in case it exists.
     */
    where: InventarioWhereUniqueInput
    /**
     * In case the Inventario found by the `where` argument doesn't exist, create a new Inventario with this data.
     */
    create: XOR<InventarioCreateInput, InventarioUncheckedCreateInput>
    /**
     * In case the Inventario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventarioUpdateInput, InventarioUncheckedUpdateInput>
  }

  /**
   * Inventario delete
   */
  export type InventarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
    /**
     * Filter which Inventario to delete.
     */
    where: InventarioWhereUniqueInput
  }

  /**
   * Inventario deleteMany
   */
  export type InventarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inventarios to delete
     */
    where?: InventarioWhereInput
    /**
     * Limit how many Inventarios to delete.
     */
    limit?: number
  }

  /**
   * Inventario.itens
   */
  export type Inventario$itensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    where?: ItemInventarioWhereInput
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    cursor?: ItemInventarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * Inventario without action
   */
  export type InventarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inventario
     */
    select?: InventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inventario
     */
    omit?: InventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventarioInclude<ExtArgs> | null
  }


  /**
   * Model ItemInventario
   */

  export type AggregateItemInventario = {
    _count: ItemInventarioCountAggregateOutputType | null
    _min: ItemInventarioMinAggregateOutputType | null
    _max: ItemInventarioMaxAggregateOutputType | null
  }

  export type ItemInventarioMinAggregateOutputType = {
    id: string | null
    inventario_id: string | null
    codigo_barra: string | null
    status_auditoria: string | null
    criadoEm: Date | null
  }

  export type ItemInventarioMaxAggregateOutputType = {
    id: string | null
    inventario_id: string | null
    codigo_barra: string | null
    status_auditoria: string | null
    criadoEm: Date | null
  }

  export type ItemInventarioCountAggregateOutputType = {
    id: number
    inventario_id: number
    codigo_barra: number
    status_auditoria: number
    criadoEm: number
    _all: number
  }


  export type ItemInventarioMinAggregateInputType = {
    id?: true
    inventario_id?: true
    codigo_barra?: true
    status_auditoria?: true
    criadoEm?: true
  }

  export type ItemInventarioMaxAggregateInputType = {
    id?: true
    inventario_id?: true
    codigo_barra?: true
    status_auditoria?: true
    criadoEm?: true
  }

  export type ItemInventarioCountAggregateInputType = {
    id?: true
    inventario_id?: true
    codigo_barra?: true
    status_auditoria?: true
    criadoEm?: true
    _all?: true
  }

  export type ItemInventarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemInventario to aggregate.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItemInventarios
    **/
    _count?: true | ItemInventarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemInventarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemInventarioMaxAggregateInputType
  }

  export type GetItemInventarioAggregateType<T extends ItemInventarioAggregateArgs> = {
        [P in keyof T & keyof AggregateItemInventario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItemInventario[P]>
      : GetScalarType<T[P], AggregateItemInventario[P]>
  }




  export type ItemInventarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemInventarioWhereInput
    orderBy?: ItemInventarioOrderByWithAggregationInput | ItemInventarioOrderByWithAggregationInput[]
    by: ItemInventarioScalarFieldEnum[] | ItemInventarioScalarFieldEnum
    having?: ItemInventarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemInventarioCountAggregateInputType | true
    _min?: ItemInventarioMinAggregateInputType
    _max?: ItemInventarioMaxAggregateInputType
  }

  export type ItemInventarioGroupByOutputType = {
    id: string
    inventario_id: string
    codigo_barra: string
    status_auditoria: string
    criadoEm: Date
    _count: ItemInventarioCountAggregateOutputType | null
    _min: ItemInventarioMinAggregateOutputType | null
    _max: ItemInventarioMaxAggregateOutputType | null
  }

  type GetItemInventarioGroupByPayload<T extends ItemInventarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemInventarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemInventarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemInventarioGroupByOutputType[P]>
            : GetScalarType<T[P], ItemInventarioGroupByOutputType[P]>
        }
      >
    >


  export type ItemInventarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inventario_id?: boolean
    codigo_barra?: boolean
    status_auditoria?: boolean
    criadoEm?: boolean
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemInventario"]>

  export type ItemInventarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inventario_id?: boolean
    codigo_barra?: boolean
    status_auditoria?: boolean
    criadoEm?: boolean
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemInventario"]>

  export type ItemInventarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inventario_id?: boolean
    codigo_barra?: boolean
    status_auditoria?: boolean
    criadoEm?: boolean
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemInventario"]>

  export type ItemInventarioSelectScalar = {
    id?: boolean
    inventario_id?: boolean
    codigo_barra?: boolean
    status_auditoria?: boolean
    criadoEm?: boolean
  }

  export type ItemInventarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "inventario_id" | "codigo_barra" | "status_auditoria" | "criadoEm", ExtArgs["result"]["itemInventario"]>
  export type ItemInventarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }
  export type ItemInventarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }
  export type ItemInventarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inventario?: boolean | InventarioDefaultArgs<ExtArgs>
  }

  export type $ItemInventarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItemInventario"
    objects: {
      inventario: Prisma.$InventarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      inventario_id: string
      codigo_barra: string
      /**
       * "ENCONTRADO_CORRETO" | "SOBRA_NA_BASE" | "FALTANTE"
       */
      status_auditoria: string
      criadoEm: Date
    }, ExtArgs["result"]["itemInventario"]>
    composites: {}
  }

  type ItemInventarioGetPayload<S extends boolean | null | undefined | ItemInventarioDefaultArgs> = $Result.GetResult<Prisma.$ItemInventarioPayload, S>

  type ItemInventarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ItemInventarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ItemInventarioCountAggregateInputType | true
    }

  export interface ItemInventarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItemInventario'], meta: { name: 'ItemInventario' } }
    /**
     * Find zero or one ItemInventario that matches the filter.
     * @param {ItemInventarioFindUniqueArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemInventarioFindUniqueArgs>(args: SelectSubset<T, ItemInventarioFindUniqueArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ItemInventario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ItemInventarioFindUniqueOrThrowArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemInventarioFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemInventarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ItemInventario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindFirstArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemInventarioFindFirstArgs>(args?: SelectSubset<T, ItemInventarioFindFirstArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ItemInventario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindFirstOrThrowArgs} args - Arguments to find a ItemInventario
     * @example
     * // Get one ItemInventario
     * const itemInventario = await prisma.itemInventario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemInventarioFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemInventarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ItemInventarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItemInventarios
     * const itemInventarios = await prisma.itemInventario.findMany()
     * 
     * // Get first 10 ItemInventarios
     * const itemInventarios = await prisma.itemInventario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemInventarioWithIdOnly = await prisma.itemInventario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemInventarioFindManyArgs>(args?: SelectSubset<T, ItemInventarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ItemInventario.
     * @param {ItemInventarioCreateArgs} args - Arguments to create a ItemInventario.
     * @example
     * // Create one ItemInventario
     * const ItemInventario = await prisma.itemInventario.create({
     *   data: {
     *     // ... data to create a ItemInventario
     *   }
     * })
     * 
     */
    create<T extends ItemInventarioCreateArgs>(args: SelectSubset<T, ItemInventarioCreateArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ItemInventarios.
     * @param {ItemInventarioCreateManyArgs} args - Arguments to create many ItemInventarios.
     * @example
     * // Create many ItemInventarios
     * const itemInventario = await prisma.itemInventario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemInventarioCreateManyArgs>(args?: SelectSubset<T, ItemInventarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItemInventarios and returns the data saved in the database.
     * @param {ItemInventarioCreateManyAndReturnArgs} args - Arguments to create many ItemInventarios.
     * @example
     * // Create many ItemInventarios
     * const itemInventario = await prisma.itemInventario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItemInventarios and only return the `id`
     * const itemInventarioWithIdOnly = await prisma.itemInventario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItemInventarioCreateManyAndReturnArgs>(args?: SelectSubset<T, ItemInventarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ItemInventario.
     * @param {ItemInventarioDeleteArgs} args - Arguments to delete one ItemInventario.
     * @example
     * // Delete one ItemInventario
     * const ItemInventario = await prisma.itemInventario.delete({
     *   where: {
     *     // ... filter to delete one ItemInventario
     *   }
     * })
     * 
     */
    delete<T extends ItemInventarioDeleteArgs>(args: SelectSubset<T, ItemInventarioDeleteArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ItemInventario.
     * @param {ItemInventarioUpdateArgs} args - Arguments to update one ItemInventario.
     * @example
     * // Update one ItemInventario
     * const itemInventario = await prisma.itemInventario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemInventarioUpdateArgs>(args: SelectSubset<T, ItemInventarioUpdateArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ItemInventarios.
     * @param {ItemInventarioDeleteManyArgs} args - Arguments to filter ItemInventarios to delete.
     * @example
     * // Delete a few ItemInventarios
     * const { count } = await prisma.itemInventario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemInventarioDeleteManyArgs>(args?: SelectSubset<T, ItemInventarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemInventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItemInventarios
     * const itemInventario = await prisma.itemInventario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemInventarioUpdateManyArgs>(args: SelectSubset<T, ItemInventarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemInventarios and returns the data updated in the database.
     * @param {ItemInventarioUpdateManyAndReturnArgs} args - Arguments to update many ItemInventarios.
     * @example
     * // Update many ItemInventarios
     * const itemInventario = await prisma.itemInventario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ItemInventarios and only return the `id`
     * const itemInventarioWithIdOnly = await prisma.itemInventario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ItemInventarioUpdateManyAndReturnArgs>(args: SelectSubset<T, ItemInventarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ItemInventario.
     * @param {ItemInventarioUpsertArgs} args - Arguments to update or create a ItemInventario.
     * @example
     * // Update or create a ItemInventario
     * const itemInventario = await prisma.itemInventario.upsert({
     *   create: {
     *     // ... data to create a ItemInventario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItemInventario we want to update
     *   }
     * })
     */
    upsert<T extends ItemInventarioUpsertArgs>(args: SelectSubset<T, ItemInventarioUpsertArgs<ExtArgs>>): Prisma__ItemInventarioClient<$Result.GetResult<Prisma.$ItemInventarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ItemInventarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioCountArgs} args - Arguments to filter ItemInventarios to count.
     * @example
     * // Count the number of ItemInventarios
     * const count = await prisma.itemInventario.count({
     *   where: {
     *     // ... the filter for the ItemInventarios we want to count
     *   }
     * })
    **/
    count<T extends ItemInventarioCountArgs>(
      args?: Subset<T, ItemInventarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemInventarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItemInventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItemInventarioAggregateArgs>(args: Subset<T, ItemInventarioAggregateArgs>): Prisma.PrismaPromise<GetItemInventarioAggregateType<T>>

    /**
     * Group by ItemInventario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemInventarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItemInventarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemInventarioGroupByArgs['orderBy'] }
        : { orderBy?: ItemInventarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItemInventarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemInventarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItemInventario model
   */
  readonly fields: ItemInventarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItemInventario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemInventarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inventario<T extends InventarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventarioDefaultArgs<ExtArgs>>): Prisma__InventarioClient<$Result.GetResult<Prisma.$InventarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ItemInventario model
   */
  interface ItemInventarioFieldRefs {
    readonly id: FieldRef<"ItemInventario", 'String'>
    readonly inventario_id: FieldRef<"ItemInventario", 'String'>
    readonly codigo_barra: FieldRef<"ItemInventario", 'String'>
    readonly status_auditoria: FieldRef<"ItemInventario", 'String'>
    readonly criadoEm: FieldRef<"ItemInventario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ItemInventario findUnique
   */
  export type ItemInventarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario findUniqueOrThrow
   */
  export type ItemInventarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario findFirst
   */
  export type ItemInventarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemInventarios.
     */
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario findFirstOrThrow
   */
  export type ItemInventarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventario to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemInventarios.
     */
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario findMany
   */
  export type ItemInventarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter, which ItemInventarios to fetch.
     */
    where?: ItemInventarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemInventarios to fetch.
     */
    orderBy?: ItemInventarioOrderByWithRelationInput | ItemInventarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItemInventarios.
     */
    cursor?: ItemInventarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemInventarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemInventarios.
     */
    skip?: number
    distinct?: ItemInventarioScalarFieldEnum | ItemInventarioScalarFieldEnum[]
  }

  /**
   * ItemInventario create
   */
  export type ItemInventarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The data needed to create a ItemInventario.
     */
    data: XOR<ItemInventarioCreateInput, ItemInventarioUncheckedCreateInput>
  }

  /**
   * ItemInventario createMany
   */
  export type ItemInventarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItemInventarios.
     */
    data: ItemInventarioCreateManyInput | ItemInventarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ItemInventario createManyAndReturn
   */
  export type ItemInventarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * The data used to create many ItemInventarios.
     */
    data: ItemInventarioCreateManyInput | ItemInventarioCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItemInventario update
   */
  export type ItemInventarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The data needed to update a ItemInventario.
     */
    data: XOR<ItemInventarioUpdateInput, ItemInventarioUncheckedUpdateInput>
    /**
     * Choose, which ItemInventario to update.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario updateMany
   */
  export type ItemInventarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItemInventarios.
     */
    data: XOR<ItemInventarioUpdateManyMutationInput, ItemInventarioUncheckedUpdateManyInput>
    /**
     * Filter which ItemInventarios to update
     */
    where?: ItemInventarioWhereInput
    /**
     * Limit how many ItemInventarios to update.
     */
    limit?: number
  }

  /**
   * ItemInventario updateManyAndReturn
   */
  export type ItemInventarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * The data used to update ItemInventarios.
     */
    data: XOR<ItemInventarioUpdateManyMutationInput, ItemInventarioUncheckedUpdateManyInput>
    /**
     * Filter which ItemInventarios to update
     */
    where?: ItemInventarioWhereInput
    /**
     * Limit how many ItemInventarios to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItemInventario upsert
   */
  export type ItemInventarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * The filter to search for the ItemInventario to update in case it exists.
     */
    where: ItemInventarioWhereUniqueInput
    /**
     * In case the ItemInventario found by the `where` argument doesn't exist, create a new ItemInventario with this data.
     */
    create: XOR<ItemInventarioCreateInput, ItemInventarioUncheckedCreateInput>
    /**
     * In case the ItemInventario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemInventarioUpdateInput, ItemInventarioUncheckedUpdateInput>
  }

  /**
   * ItemInventario delete
   */
  export type ItemInventarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
    /**
     * Filter which ItemInventario to delete.
     */
    where: ItemInventarioWhereUniqueInput
  }

  /**
   * ItemInventario deleteMany
   */
  export type ItemInventarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemInventarios to delete
     */
    where?: ItemInventarioWhereInput
    /**
     * Limit how many ItemInventarios to delete.
     */
    limit?: number
  }

  /**
   * ItemInventario without action
   */
  export type ItemInventarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemInventario
     */
    select?: ItemInventarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ItemInventario
     */
    omit?: ItemInventarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemInventarioInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InventarioScalarFieldEnum: {
    id: 'id',
    data: 'data',
    unidade_id: 'unidade_id',
    status: 'status',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
  };

  export type InventarioScalarFieldEnum = (typeof InventarioScalarFieldEnum)[keyof typeof InventarioScalarFieldEnum]


  export const ItemInventarioScalarFieldEnum: {
    id: 'id',
    inventario_id: 'inventario_id',
    codigo_barra: 'codigo_barra',
    status_auditoria: 'status_auditoria',
    criadoEm: 'criadoEm'
  };

  export type ItemInventarioScalarFieldEnum = (typeof ItemInventarioScalarFieldEnum)[keyof typeof ItemInventarioScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type InventarioWhereInput = {
    AND?: InventarioWhereInput | InventarioWhereInput[]
    OR?: InventarioWhereInput[]
    NOT?: InventarioWhereInput | InventarioWhereInput[]
    id?: StringFilter<"Inventario"> | string
    data?: DateTimeFilter<"Inventario"> | Date | string
    unidade_id?: IntFilter<"Inventario"> | number
    status?: StringFilter<"Inventario"> | string
    criadoEm?: DateTimeFilter<"Inventario"> | Date | string
    atualizadoEm?: DateTimeFilter<"Inventario"> | Date | string
    itens?: ItemInventarioListRelationFilter
  }

  export type InventarioOrderByWithRelationInput = {
    id?: SortOrder
    data?: SortOrder
    unidade_id?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    itens?: ItemInventarioOrderByRelationAggregateInput
  }

  export type InventarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InventarioWhereInput | InventarioWhereInput[]
    OR?: InventarioWhereInput[]
    NOT?: InventarioWhereInput | InventarioWhereInput[]
    data?: DateTimeFilter<"Inventario"> | Date | string
    unidade_id?: IntFilter<"Inventario"> | number
    status?: StringFilter<"Inventario"> | string
    criadoEm?: DateTimeFilter<"Inventario"> | Date | string
    atualizadoEm?: DateTimeFilter<"Inventario"> | Date | string
    itens?: ItemInventarioListRelationFilter
  }, "id">

  export type InventarioOrderByWithAggregationInput = {
    id?: SortOrder
    data?: SortOrder
    unidade_id?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    _count?: InventarioCountOrderByAggregateInput
    _avg?: InventarioAvgOrderByAggregateInput
    _max?: InventarioMaxOrderByAggregateInput
    _min?: InventarioMinOrderByAggregateInput
    _sum?: InventarioSumOrderByAggregateInput
  }

  export type InventarioScalarWhereWithAggregatesInput = {
    AND?: InventarioScalarWhereWithAggregatesInput | InventarioScalarWhereWithAggregatesInput[]
    OR?: InventarioScalarWhereWithAggregatesInput[]
    NOT?: InventarioScalarWhereWithAggregatesInput | InventarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Inventario"> | string
    data?: DateTimeWithAggregatesFilter<"Inventario"> | Date | string
    unidade_id?: IntWithAggregatesFilter<"Inventario"> | number
    status?: StringWithAggregatesFilter<"Inventario"> | string
    criadoEm?: DateTimeWithAggregatesFilter<"Inventario"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Inventario"> | Date | string
  }

  export type ItemInventarioWhereInput = {
    AND?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    OR?: ItemInventarioWhereInput[]
    NOT?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    id?: StringFilter<"ItemInventario"> | string
    inventario_id?: StringFilter<"ItemInventario"> | string
    codigo_barra?: StringFilter<"ItemInventario"> | string
    status_auditoria?: StringFilter<"ItemInventario"> | string
    criadoEm?: DateTimeFilter<"ItemInventario"> | Date | string
    inventario?: XOR<InventarioScalarRelationFilter, InventarioWhereInput>
  }

  export type ItemInventarioOrderByWithRelationInput = {
    id?: SortOrder
    inventario_id?: SortOrder
    codigo_barra?: SortOrder
    status_auditoria?: SortOrder
    criadoEm?: SortOrder
    inventario?: InventarioOrderByWithRelationInput
  }

  export type ItemInventarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    OR?: ItemInventarioWhereInput[]
    NOT?: ItemInventarioWhereInput | ItemInventarioWhereInput[]
    inventario_id?: StringFilter<"ItemInventario"> | string
    codigo_barra?: StringFilter<"ItemInventario"> | string
    status_auditoria?: StringFilter<"ItemInventario"> | string
    criadoEm?: DateTimeFilter<"ItemInventario"> | Date | string
    inventario?: XOR<InventarioScalarRelationFilter, InventarioWhereInput>
  }, "id">

  export type ItemInventarioOrderByWithAggregationInput = {
    id?: SortOrder
    inventario_id?: SortOrder
    codigo_barra?: SortOrder
    status_auditoria?: SortOrder
    criadoEm?: SortOrder
    _count?: ItemInventarioCountOrderByAggregateInput
    _max?: ItemInventarioMaxOrderByAggregateInput
    _min?: ItemInventarioMinOrderByAggregateInput
  }

  export type ItemInventarioScalarWhereWithAggregatesInput = {
    AND?: ItemInventarioScalarWhereWithAggregatesInput | ItemInventarioScalarWhereWithAggregatesInput[]
    OR?: ItemInventarioScalarWhereWithAggregatesInput[]
    NOT?: ItemInventarioScalarWhereWithAggregatesInput | ItemInventarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ItemInventario"> | string
    inventario_id?: StringWithAggregatesFilter<"ItemInventario"> | string
    codigo_barra?: StringWithAggregatesFilter<"ItemInventario"> | string
    status_auditoria?: StringWithAggregatesFilter<"ItemInventario"> | string
    criadoEm?: DateTimeWithAggregatesFilter<"ItemInventario"> | Date | string
  }

  export type InventarioCreateInput = {
    id?: string
    data?: Date | string
    unidade_id: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    itens?: ItemInventarioCreateNestedManyWithoutInventarioInput
  }

  export type InventarioUncheckedCreateInput = {
    id?: string
    data?: Date | string
    unidade_id: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    itens?: ItemInventarioUncheckedCreateNestedManyWithoutInventarioInput
  }

  export type InventarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: ItemInventarioUpdateManyWithoutInventarioNestedInput
  }

  export type InventarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: ItemInventarioUncheckedUpdateManyWithoutInventarioNestedInput
  }

  export type InventarioCreateManyInput = {
    id?: string
    data?: Date | string
    unidade_id: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type InventarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioCreateInput = {
    id?: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
    inventario: InventarioCreateNestedOneWithoutItensInput
  }

  export type ItemInventarioUncheckedCreateInput = {
    id?: string
    inventario_id: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
  }

  export type ItemInventarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    inventario?: InventarioUpdateOneRequiredWithoutItensNestedInput
  }

  export type ItemInventarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inventario_id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioCreateManyInput = {
    id?: string
    inventario_id: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
  }

  export type ItemInventarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    inventario_id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type ItemInventarioListRelationFilter = {
    every?: ItemInventarioWhereInput
    some?: ItemInventarioWhereInput
    none?: ItemInventarioWhereInput
  }

  export type ItemInventarioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InventarioCountOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    unidade_id?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type InventarioAvgOrderByAggregateInput = {
    unidade_id?: SortOrder
  }

  export type InventarioMaxOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    unidade_id?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type InventarioMinOrderByAggregateInput = {
    id?: SortOrder
    data?: SortOrder
    unidade_id?: SortOrder
    status?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type InventarioSumOrderByAggregateInput = {
    unidade_id?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type InventarioScalarRelationFilter = {
    is?: InventarioWhereInput
    isNot?: InventarioWhereInput
  }

  export type ItemInventarioCountOrderByAggregateInput = {
    id?: SortOrder
    inventario_id?: SortOrder
    codigo_barra?: SortOrder
    status_auditoria?: SortOrder
    criadoEm?: SortOrder
  }

  export type ItemInventarioMaxOrderByAggregateInput = {
    id?: SortOrder
    inventario_id?: SortOrder
    codigo_barra?: SortOrder
    status_auditoria?: SortOrder
    criadoEm?: SortOrder
  }

  export type ItemInventarioMinOrderByAggregateInput = {
    id?: SortOrder
    inventario_id?: SortOrder
    codigo_barra?: SortOrder
    status_auditoria?: SortOrder
    criadoEm?: SortOrder
  }

  export type ItemInventarioCreateNestedManyWithoutInventarioInput = {
    create?: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput> | ItemInventarioCreateWithoutInventarioInput[] | ItemInventarioUncheckedCreateWithoutInventarioInput[]
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutInventarioInput | ItemInventarioCreateOrConnectWithoutInventarioInput[]
    createMany?: ItemInventarioCreateManyInventarioInputEnvelope
    connect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
  }

  export type ItemInventarioUncheckedCreateNestedManyWithoutInventarioInput = {
    create?: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput> | ItemInventarioCreateWithoutInventarioInput[] | ItemInventarioUncheckedCreateWithoutInventarioInput[]
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutInventarioInput | ItemInventarioCreateOrConnectWithoutInventarioInput[]
    createMany?: ItemInventarioCreateManyInventarioInputEnvelope
    connect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ItemInventarioUpdateManyWithoutInventarioNestedInput = {
    create?: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput> | ItemInventarioCreateWithoutInventarioInput[] | ItemInventarioUncheckedCreateWithoutInventarioInput[]
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutInventarioInput | ItemInventarioCreateOrConnectWithoutInventarioInput[]
    upsert?: ItemInventarioUpsertWithWhereUniqueWithoutInventarioInput | ItemInventarioUpsertWithWhereUniqueWithoutInventarioInput[]
    createMany?: ItemInventarioCreateManyInventarioInputEnvelope
    set?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    disconnect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    delete?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    connect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    update?: ItemInventarioUpdateWithWhereUniqueWithoutInventarioInput | ItemInventarioUpdateWithWhereUniqueWithoutInventarioInput[]
    updateMany?: ItemInventarioUpdateManyWithWhereWithoutInventarioInput | ItemInventarioUpdateManyWithWhereWithoutInventarioInput[]
    deleteMany?: ItemInventarioScalarWhereInput | ItemInventarioScalarWhereInput[]
  }

  export type ItemInventarioUncheckedUpdateManyWithoutInventarioNestedInput = {
    create?: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput> | ItemInventarioCreateWithoutInventarioInput[] | ItemInventarioUncheckedCreateWithoutInventarioInput[]
    connectOrCreate?: ItemInventarioCreateOrConnectWithoutInventarioInput | ItemInventarioCreateOrConnectWithoutInventarioInput[]
    upsert?: ItemInventarioUpsertWithWhereUniqueWithoutInventarioInput | ItemInventarioUpsertWithWhereUniqueWithoutInventarioInput[]
    createMany?: ItemInventarioCreateManyInventarioInputEnvelope
    set?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    disconnect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    delete?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    connect?: ItemInventarioWhereUniqueInput | ItemInventarioWhereUniqueInput[]
    update?: ItemInventarioUpdateWithWhereUniqueWithoutInventarioInput | ItemInventarioUpdateWithWhereUniqueWithoutInventarioInput[]
    updateMany?: ItemInventarioUpdateManyWithWhereWithoutInventarioInput | ItemInventarioUpdateManyWithWhereWithoutInventarioInput[]
    deleteMany?: ItemInventarioScalarWhereInput | ItemInventarioScalarWhereInput[]
  }

  export type InventarioCreateNestedOneWithoutItensInput = {
    create?: XOR<InventarioCreateWithoutItensInput, InventarioUncheckedCreateWithoutItensInput>
    connectOrCreate?: InventarioCreateOrConnectWithoutItensInput
    connect?: InventarioWhereUniqueInput
  }

  export type InventarioUpdateOneRequiredWithoutItensNestedInput = {
    create?: XOR<InventarioCreateWithoutItensInput, InventarioUncheckedCreateWithoutItensInput>
    connectOrCreate?: InventarioCreateOrConnectWithoutItensInput
    upsert?: InventarioUpsertWithoutItensInput
    connect?: InventarioWhereUniqueInput
    update?: XOR<XOR<InventarioUpdateToOneWithWhereWithoutItensInput, InventarioUpdateWithoutItensInput>, InventarioUncheckedUpdateWithoutItensInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ItemInventarioCreateWithoutInventarioInput = {
    id?: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
  }

  export type ItemInventarioUncheckedCreateWithoutInventarioInput = {
    id?: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
  }

  export type ItemInventarioCreateOrConnectWithoutInventarioInput = {
    where: ItemInventarioWhereUniqueInput
    create: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput>
  }

  export type ItemInventarioCreateManyInventarioInputEnvelope = {
    data: ItemInventarioCreateManyInventarioInput | ItemInventarioCreateManyInventarioInput[]
    skipDuplicates?: boolean
  }

  export type ItemInventarioUpsertWithWhereUniqueWithoutInventarioInput = {
    where: ItemInventarioWhereUniqueInput
    update: XOR<ItemInventarioUpdateWithoutInventarioInput, ItemInventarioUncheckedUpdateWithoutInventarioInput>
    create: XOR<ItemInventarioCreateWithoutInventarioInput, ItemInventarioUncheckedCreateWithoutInventarioInput>
  }

  export type ItemInventarioUpdateWithWhereUniqueWithoutInventarioInput = {
    where: ItemInventarioWhereUniqueInput
    data: XOR<ItemInventarioUpdateWithoutInventarioInput, ItemInventarioUncheckedUpdateWithoutInventarioInput>
  }

  export type ItemInventarioUpdateManyWithWhereWithoutInventarioInput = {
    where: ItemInventarioScalarWhereInput
    data: XOR<ItemInventarioUpdateManyMutationInput, ItemInventarioUncheckedUpdateManyWithoutInventarioInput>
  }

  export type ItemInventarioScalarWhereInput = {
    AND?: ItemInventarioScalarWhereInput | ItemInventarioScalarWhereInput[]
    OR?: ItemInventarioScalarWhereInput[]
    NOT?: ItemInventarioScalarWhereInput | ItemInventarioScalarWhereInput[]
    id?: StringFilter<"ItemInventario"> | string
    inventario_id?: StringFilter<"ItemInventario"> | string
    codigo_barra?: StringFilter<"ItemInventario"> | string
    status_auditoria?: StringFilter<"ItemInventario"> | string
    criadoEm?: DateTimeFilter<"ItemInventario"> | Date | string
  }

  export type InventarioCreateWithoutItensInput = {
    id?: string
    data?: Date | string
    unidade_id: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type InventarioUncheckedCreateWithoutItensInput = {
    id?: string
    data?: Date | string
    unidade_id: number
    status?: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type InventarioCreateOrConnectWithoutItensInput = {
    where: InventarioWhereUniqueInput
    create: XOR<InventarioCreateWithoutItensInput, InventarioUncheckedCreateWithoutItensInput>
  }

  export type InventarioUpsertWithoutItensInput = {
    update: XOR<InventarioUpdateWithoutItensInput, InventarioUncheckedUpdateWithoutItensInput>
    create: XOR<InventarioCreateWithoutItensInput, InventarioUncheckedCreateWithoutItensInput>
    where?: InventarioWhereInput
  }

  export type InventarioUpdateToOneWithWhereWithoutItensInput = {
    where?: InventarioWhereInput
    data: XOR<InventarioUpdateWithoutItensInput, InventarioUncheckedUpdateWithoutItensInput>
  }

  export type InventarioUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventarioUncheckedUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    data?: DateTimeFieldUpdateOperationsInput | Date | string
    unidade_id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioCreateManyInventarioInput = {
    id?: string
    codigo_barra: string
    status_auditoria: string
    criadoEm?: Date | string
  }

  export type ItemInventarioUpdateWithoutInventarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioUncheckedUpdateWithoutInventarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemInventarioUncheckedUpdateManyWithoutInventarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo_barra?: StringFieldUpdateOperationsInput | string
    status_auditoria?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}