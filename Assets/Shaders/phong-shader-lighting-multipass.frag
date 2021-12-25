#version 330

in vec2 vertexUv;
in vec3 vertexPos;
in vec3 vertexNormal;

out vec4 colour;

const int MAX_POINT_LIGHTS = 3;

struct Light
{
	vec3 ambientColor;
	vec3 diffuseColor;
	vec3 specularColor;
};

struct DirectionalLight 
{
	Light base;
	vec3 direction;
	float intensity;
};

struct PointLight
{
	Light base;
	vec3 position;
	float constant;
	float linear;
	float exponent;
};

struct Material
{
	sampler2D difuse;
	sampler2D specular;
	float shininess;
};

uniform int pointLightCount;

uniform DirectionalLight directionalLight;
uniform PointLight pointLights[MAX_POINT_LIGHTS];
uniform Material material;

uniform vec3 cameraPosition;

uniform sampler2D RenderTex;
uniform float EdgeThreshold; // The squared threshold value
uniform int Width; // The pixel width
uniform int Height; // The pixel height

subroutine vec4 RenderPassType();
subroutine uniform RenderPassType RenderPass;

// Approximates the brightness of a RGB value.
float luma( vec3 color ) {
 return 0.2126 * color.r + 0.7152 * color.g +
 0.0722 * color.b;
}

vec3 CalcDirLight(DirectionalLight light, vec3 normal, vec3 viewv, Material material, vec2 vertexUv)
{
	vec3 lightDir = normalize(light.direction);//Tarea porque -1

	vec3 refl = reflect(lightDir , normal);
	//ambient light computation
	vec3 ambient = light.base.ambientColor * texture(material.difuse,vertexUv).rgb;
	//diffuse light computation
	vec3 diffuse = light.base.diffuseColor * max(dot(normal, lightDir), 0.0) * texture(material.difuse,vertexUv).rgb;

	//specular light computation
	vec3 specular = vec3( 0.0, 0.0, 0.0 );
	specular = pow(max(0.0, dot(viewv,refl)), material.shininess)*light.base.specularColor;

	return clamp(ambient + diffuse + specular , 0.0, 1.0);
}


vec3 CalPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 view)
{
	float distance = length(light.position-fragPos);
	vec3 lightDir = normalize(light.position-fragPos);
	vec3 ambient = clamp(light.base.ambientColor, 0.0, 1.0) * texture(material.difuse,vertexUv).rgb;

	vec3 diffuse = light.base.diffuseColor * max(dot(normal, lightDir), 0.0) * texture(material.difuse,vertexUv).rgb;

	vec3 specular = vec3( 0.0, 0.0, 0.0 );
	vec3 refl = reflect(lightDir , normal);
	specular = pow(max(0.0, dot(view,refl)), material.shininess)*light.base.specularColor;

	float attenuation = 1/ (light.constant+light.linear*distance +light.exponent*(distance*distance));

	return clamp((ambient + diffuse + specular)*attenuation , 0.0, 1.0);
}


// Pass #1
subroutine (RenderPassType)
vec4 pass1()
{
return vec4(1.0,0.0,0.0,1.0);
	vec3 norm = normalize(vertexNormal);
	vec3 viewDir = normalize(cameraPosition - vertexPos);
	vec3 lightResult = CalcDirLight(directionalLight, norm, viewDir, material, vertexUv);

	for(int i=0; i < MAX_POINT_LIGHTS; ++i)
	{
		lightResult += CalPointLight(pointLights[i], norm, vertexPos, viewDir);
	}
	return vec4(lightResult,1.0);
}

// Pass #2
subroutine( RenderPassType )
vec4 pass2()
{
  vec3 col = texture(RenderTex, vertexUv).rgb;
  //return vec4(col,1.0);
	return vec4(1.0,0.0,1.0,1.0);
 float dx = 1.0 / float(Width);
 float dy = 1.0 / float(Height);
 float s00 = luma(texture( RenderTex,
 vertexUv + vec2(-dx,dy) ).rgb);
 float s10 = luma(texture( RenderTex,
 vertexUv + vec2(-dx,0.0) ).rgb);
 float s20 = luma(texture( RenderTex,
 vertexUv + vec2(-dx,-dy) ).rgb);
 float s01 = luma(texture( RenderTex,
 vertexUv + vec2(0.0,dy) ).rgb);
 float s21 = luma(texture( RenderTex,
 vertexUv + vec2(0.0,-dy) ).rgb);
 float s02 = luma(texture( RenderTex,
  vertexUv + vec2(dx, dy) ).rgb);
 float s12 = luma(texture( RenderTex,
 vertexUv + vec2(dx, 0.0) ).rgb);
 float s22 = luma(texture( RenderTex,
 vertexUv + vec2(dx, -dy) ).rgb);
 float sx = s00 + 2 * s10 + s20 - (s02 + 2 * s12 + s22);
 float sy = s00 + 2 * s01 + s02 - (s20 + 2 * s21 + s22);
 float dist = sx * sx + sy * sy;
 if( dist>1 )
 return vec4(1.0,1.0,0.0,1.0);
 else
 return vec4(1.0,0.0,0.0,1.0);
}
void main()
{
	colour = RenderPass();
}
