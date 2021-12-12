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

struct FogInfo {
 float maxDist;
 float minDist;
 vec3 color;
};
uniform FogInfo Fog;

uniform int pointLightCount;

uniform DirectionalLight directionalLight;
uniform PointLight pointLights[MAX_POINT_LIGHTS];
uniform Material material;

uniform vec3 cameraPosition;

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

void main()
{
	vec3 norm = normalize(vertexNormal);
	vec3 viewDir = normalize(cameraPosition - vertexPos);
	vec3 lightResult = CalcDirLight(directionalLight, norm, viewDir, material, vertexUv);

	for(int i=0; i < MAX_POINT_LIGHTS; ++i)
	{
		lightResult += CalPointLight(pointLights[i], norm, vertexPos, viewDir);
	}

	
	float dist = distance(cameraPosition,vertexPos);
	float fogFactor = (Fog.maxDist - dist) /
						(Fog.maxDist - Fog.minDist);
	fogFactor = clamp( fogFactor, 0.0, 1.0 );

	vec3 color = mix( Fog.color, lightResult, fogFactor );

	colour = vec4(color,1.0);
}


//  vec3 Normal = texture(normalMap, TexCoord).rgb;
//  Normal = normalize(Normal*2-1);  
//	Normal = normalize(TBN * Normal); 
//
//	vec4 finalColour = CalcDirectionalLight();
//	finalColour += CalcPointLights();
//	
//	colour = texture(normalMap, TexCoord)*vec4(ADSLightModel(Normal,FragPos),1);



//vec4 CalcLightByDirection(DirectionalLight light)
//{
////    vec3 Normal = texture(normalMap, TexCoord).rgb;
////    Normal = normalize(Normal*2-1);  
////	Normal = normalize(TBN * Normal); 
//////
//	vec3 ambientColour = light.base.ambientColor * light.intensity;
////	
//	float diffuseFactor = max(dot(normalize(Normal), normalize(light.direction)), 0.0f);
//	vec4 diffuseColour = vec4(light.colour * light.diffuseIntensity * diffuseFactor, 1.0f);
//	
//	vec4 specularColour = vec4(0, 0, 0, 0);
//	
//	if(diffuseFactor > 0.0f)
//	{
//		vec3 fragToEye = normalize(eyePosition - FragPos);
//		vec3 reflectedVertex = normalize(reflect(direction, normalize(Normal)));
//		
//		float specularFactor = dot(fragToEye, reflectedVertex);
//		if(specularFactor > 0.0f)
//		{
//			specularFactor = pow(specularFactor, material.shininess);
//			specularColour = vec4(light.colour * material.specularIntensity * specularFactor, 1.0f);
//		}
//	}
//
//	return (ambientColour + diffuseColour + specularColour);
//}
//
//vec4 CalcDirectionalLight()
//{
//	return CalcLightByDirection(directionalLight.base, directionalLight.direction);
//}
//
//vec4 CalcPointLights()
//{
//	vec4 totalColour = vec4(0, 0, 0, 0);
//	for(int i = 0; i < pointLightCount; i++)
//	{
//		vec3 direction = FragPos - pointLights[i].position;
//		float distance = length(direction);
//		direction = normalize(direction);
//		vec4 colour = CalcLightByDirection(pointLights[i].base, direction);
//		float attenuation = pointLights[i].exponent * distance * distance +
//							pointLights[i].linear * distance +
//							pointLights[i].constant;
//		
//		totalColour += (colour / attenuation);
//	}
//	
//	return totalColour;
//}
//
//vec3 ADSLightModel( in vec3 myNormal, in vec3 myPosition )
//{
//	
//	const vec3 myLightPosition = vec3( 0.2, 0.2, 0.2 );
//	const vec3 myLightAmbient = vec3( 0.2, 0.2, 0.2 );
//	const vec3 myLightDiffuse = vec3( 1.0 , 1.0 , 1.0 );
//	const vec3 myLightSpecular = vec3( 1.0 , 1.0 , 1.0 );
//	const vec3 myMaterialAmbient = vec3( 1.0 , 0.5, 0.0 );
//	const vec3 myMaterialDiffuse = vec3( 1.0 , 0.5, 0.0 );
//	const vec3 myMaterialSpecular = vec3( 0.6, 0.6, 0.6 );
//	const float myMaterialShininess = 1.0;
//	//normal, light, view, and light reflection vectors
//	vec3 norm = normalize( myNormal );
//	vec3 lightv = normalize( myLightPosition - myPosition);
//	vec3 viewv = normalize( vec3(0.,0.,0.) - myPosition );
//	vec3 refl = reflect( vec3(0.,0.,0.) - lightv, norm );
//	//ambient light computation
//	vec3 ambient = myMaterialAmbient*myLightAmbient;
//	//diffuse light computation
//	vec3 diffuse = max(0.0, dot(lightv, norm)) * myMaterialDiffuse *myLightDiffuse;
//	//Optionally you can add a diffuse attenuation term at this
//	//point
//	//   7717098016
//	//specular light computation
//	vec3 specular = vec3( 0.0, 0.0, 0.0 );
//	if( dot(lightv, viewv) > 0.0)
//	{
//	 specular = pow(max(0.0, dot(viewv,refl)), myMaterialShininess)*myMaterialSpecular*	myLightSpecular;
//	}
//	return clamp( ambient + diffuse + specular, 0.0, 1.0);
//}