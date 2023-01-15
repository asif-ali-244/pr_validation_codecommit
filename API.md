# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CodeCommitPrValidation <a name="CodeCommitPrValidation" id="pr_validation_codecommit.CodeCommitPrValidation"></a>

#### Initializers <a name="Initializers" id="pr_validation_codecommit.CodeCommitPrValidation.Initializer"></a>

```typescript
import { CodeCommitPrValidation } from 'pr_validation_codecommit'

new CodeCommitPrValidation(scope: Construct, id: string, props: CodeCommitPrValidationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.props">props</a></code> | <code><a href="#pr_validation_codecommit.CodeCommitPrValidationProps">CodeCommitPrValidationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="pr_validation_codecommit.CodeCommitPrValidation.Initializer.parameter.props"></a>

- *Type:* <a href="#pr_validation_codecommit.CodeCommitPrValidationProps">CodeCommitPrValidationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="pr_validation_codecommit.CodeCommitPrValidation.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="pr_validation_codecommit.CodeCommitPrValidation.isConstruct"></a>

```typescript
import { CodeCommitPrValidation } from 'pr_validation_codecommit'

CodeCommitPrValidation.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="pr_validation_codecommit.CodeCommitPrValidation.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidation.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="pr_validation_codecommit.CodeCommitPrValidation.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### CodeCommitPrValidationProps <a name="CodeCommitPrValidationProps" id="pr_validation_codecommit.CodeCommitPrValidationProps"></a>

#### Initializer <a name="Initializer" id="pr_validation_codecommit.CodeCommitPrValidationProps.Initializer"></a>

```typescript
import { CodeCommitPrValidationProps } from 'pr_validation_codecommit'

const codeCommitPrValidationProps: CodeCommitPrValidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#pr_validation_codecommit.CodeCommitPrValidationProps.property.config">config</a></code> | <code><a href="#pr_validation_codecommit.ConfigProps">ConfigProps</a>[]</code> | *No description.* |

---

##### `config`<sup>Required</sup> <a name="config" id="pr_validation_codecommit.CodeCommitPrValidationProps.property.config"></a>

```typescript
public readonly config: ConfigProps[];
```

- *Type:* <a href="#pr_validation_codecommit.ConfigProps">ConfigProps</a>[]

---

### ConfigProps <a name="ConfigProps" id="pr_validation_codecommit.ConfigProps"></a>

#### Initializer <a name="Initializer" id="pr_validation_codecommit.ConfigProps.Initializer"></a>

```typescript
import { ConfigProps } from 'pr_validation_codecommit'

const configProps: ConfigProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#pr_validation_codecommit.ConfigProps.property.repoName">repoName</a></code> | <code>string</code> | Repository Name. |
| <code><a href="#pr_validation_codecommit.ConfigProps.property.projectConfig">projectConfig</a></code> | <code>aws-cdk-lib.aws_codebuild.ProjectProps</code> | Code Build configuration for PR validation. |

---

##### `repoName`<sup>Required</sup> <a name="repoName" id="pr_validation_codecommit.ConfigProps.property.repoName"></a>

```typescript
public readonly repoName: string;
```

- *Type:* string

Repository Name.

---

##### `projectConfig`<sup>Optional</sup> <a name="projectConfig" id="pr_validation_codecommit.ConfigProps.property.projectConfig"></a>

```typescript
public readonly projectConfig: ProjectProps;
```

- *Type:* aws-cdk-lib.aws_codebuild.ProjectProps

Code Build configuration for PR validation.

---



