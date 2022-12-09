# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CodeCommitPrValidation <a name="CodeCommitPrValidation" id="PR_Validation_CodeCommit.CodeCommitPrValidation"></a>

#### Initializers <a name="Initializers" id="PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer"></a>

```typescript
import { CodeCommitPrValidation } from 'PR_Validation_CodeCommit'

new CodeCommitPrValidation(scope: Construct, id: string, props: CodeCommitPrValidationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.props">props</a></code> | <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidationProps">CodeCommitPrValidationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="PR_Validation_CodeCommit.CodeCommitPrValidation.Initializer.parameter.props"></a>

- *Type:* <a href="#PR_Validation_CodeCommit.CodeCommitPrValidationProps">CodeCommitPrValidationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="PR_Validation_CodeCommit.CodeCommitPrValidation.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="PR_Validation_CodeCommit.CodeCommitPrValidation.isConstruct"></a>

```typescript
import { CodeCommitPrValidation } from 'PR_Validation_CodeCommit'

CodeCommitPrValidation.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="PR_Validation_CodeCommit.CodeCommitPrValidation.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidation.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="PR_Validation_CodeCommit.CodeCommitPrValidation.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### CodeCommitPrValidationProps <a name="CodeCommitPrValidationProps" id="PR_Validation_CodeCommit.CodeCommitPrValidationProps"></a>

#### Initializer <a name="Initializer" id="PR_Validation_CodeCommit.CodeCommitPrValidationProps.Initializer"></a>

```typescript
import { CodeCommitPrValidationProps } from 'PR_Validation_CodeCommit'

const codeCommitPrValidationProps: CodeCommitPrValidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#PR_Validation_CodeCommit.CodeCommitPrValidationProps.property.config">config</a></code> | <code><a href="#PR_Validation_CodeCommit.ConfigProps">ConfigProps</a>[]</code> | List of {@link ConfigProps}. |

---

##### `config`<sup>Required</sup> <a name="config" id="PR_Validation_CodeCommit.CodeCommitPrValidationProps.property.config"></a>

```typescript
public readonly config: ConfigProps[];
```

- *Type:* <a href="#PR_Validation_CodeCommit.ConfigProps">ConfigProps</a>[]

List of {@link ConfigProps}.

---

### ConfigProps <a name="ConfigProps" id="PR_Validation_CodeCommit.ConfigProps"></a>

#### Initializer <a name="Initializer" id="PR_Validation_CodeCommit.ConfigProps.Initializer"></a>

```typescript
import { ConfigProps } from 'PR_Validation_CodeCommit'

const configProps: ConfigProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#PR_Validation_CodeCommit.ConfigProps.property.repoName">repoName</a></code> | <code>string</code> | Repository Name. |
| <code><a href="#PR_Validation_CodeCommit.ConfigProps.property.projectConfig">projectConfig</a></code> | <code>aws-cdk-lib.aws_codebuild.ProjectProps</code> | Code Build configuration for PR validation. |

---

##### `repoName`<sup>Required</sup> <a name="repoName" id="PR_Validation_CodeCommit.ConfigProps.property.repoName"></a>

```typescript
public readonly repoName: string;
```

- *Type:* string

Repository Name.

---

##### `projectConfig`<sup>Optional</sup> <a name="projectConfig" id="PR_Validation_CodeCommit.ConfigProps.property.projectConfig"></a>

```typescript
public readonly projectConfig: ProjectProps;
```

- *Type:* aws-cdk-lib.aws_codebuild.ProjectProps

Code Build configuration for PR validation.

---



